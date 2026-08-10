import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getEmbedding } from '@/utils/embeddings'

// Fonction utilitaire de découpage de texte (chunking)
function splitIntoChunks(text, chunkSize = 500, overlap = 100) {
  const chunks = []
  let startIndex = 0

  // Nettoyage sommaire des espaces multiples
  const cleanText = text.replace(/\s+/g, ' ').trim()

  while (startIndex < cleanText.length) {
    const chunk = cleanText.substring(startIndex, startIndex + chunkSize)
    chunks.push(chunk)
    startIndex += (chunkSize - overlap)
  }

  return chunks
}

// Extraction du texte d'un PDF — utilise unpdf (conçu pour Next.js server/edge)
async function extractTextFromPdf(buffer) {
  const { extractText } = await import('unpdf')
  const uint8Array = new Uint8Array(buffer)
  const { text } = await extractText(uint8Array, { mergePages: true })
  return text || ''
}
export async function POST(req) {
  // Sauvegarder resourceId au début pour le réutiliser dans le catch
  let resourceId = null

  try {
    // 1. Vérification de la session utilisateur (via le client "anon" classique)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupération des paramètres de la requête
    const body = await req.json()
    resourceId = body.resourceId
    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId manquant' }, { status: 400 })
    }

    // 3. Récupération des métadonnées du document depuis la DB
    const { data: resource, error: fetchError } = await supabase
      .from('resource')
      .select('*')
      .eq('id', resourceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 })
    }

    // Utiliser le client admin (service_role) pour les opérations qui nécessitent
    // de contourner le RLS (mise à jour de statut, insertion de chunks)
    const adminClient = createAdminClient()

    // Mettre à jour le statut en "processing" pendant l'analyse
    await adminClient
      .from('resource')
      .update({ index_status: 'processing' })
      .eq('id', resourceId)

    // 4. Téléchargement du fichier depuis Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resources')
      .download(resource.file_url)

    if (downloadError || !fileData) {
      throw new Error(`Erreur lors du téléchargement du fichier : ${downloadError?.message || 'Fichier vide'}`)
    }

    // 5. Extraction du texte selon le type de fichier
    let extractedText = ''
    const fileExtension = (resource.file_type || resource.file_url.split('.').pop()).toLowerCase().trim()

    if (fileExtension === 'pdf') {
      const buffer = Buffer.from(await fileData.arrayBuffer())
      extractedText = await extractTextFromPdf(buffer)
    } else if (['txt', 'md'].includes(fileExtension)) {
      extractedText = await fileData.text()
    } else {
      throw new Error(`Type de fichier non pris en charge pour l'indexation : ${fileExtension}`)
    }

    if (!extractedText.trim()) {
      throw new Error("Aucun texte n'a pu être extrait du document.")
    }

    // Sauvegarder le texte brut dans la ressource pour référence future
    await adminClient
      .from('resource')
      .update({ raw_content: extractedText })
      .eq('id', resourceId)

    // 6. Découpage en morceaux (Chunks)
    const chunks = splitIntoChunks(extractedText, 500, 100)

    // 7. Génération des embeddings via API distante et insertion en base de données
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i]
      
      // Générer le vecteur d'embedding gte-small (384 dimensions) via Hugging Face API
      const embedding = await getEmbedding(chunkText)

      // Insertion via adminClient (service_role) pour contourner le RLS
      const { error: insertError } = await adminClient
        .from('chunk')
        .insert({
          resource_id: resourceId,
          content: chunkText,
          embedding: embedding,
          chunk_index: i
        })

      if (insertError) {
        throw new Error(`Erreur lors de l'insertion du chunk ${i} : ${insertError.message}`)
      }
    }

    // 8. Mise à jour finale de l'index_status à "ready"
    await adminClient
      .from('resource')
      .update({ index_status: 'ready' })
      .eq('id', resourceId)

    return NextResponse.json({ success: true, chunksCount: chunks.length })

  } catch (error) {
    console.error('Erreur API Ingest:', error)

    if (resourceId) {
      try {
        const adminClient = createAdminClient()
        await adminClient
          .from('resource')
          .update({ index_status: 'error' })
          .eq('id', resourceId)
      } catch (_) {}
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
