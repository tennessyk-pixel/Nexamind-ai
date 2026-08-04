import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: 'compatible',
})

const modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemma-4-26b-a4b-it:free'

export async function POST(req) {
  try {
    // 1. Authentification
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupération des paramètres
    const { resourceId, action } = await req.json()
    if (!resourceId || !action) {
      return NextResponse.json({ error: 'Paramètres resourceId ou action manquants' }, { status: 400 })
    }

    if (action !== 'summarize' && action !== 'extract_points') {
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }

    // 3. Récupération de la ressource
    const { data: resource, error: fetchError } = await supabase
      .from('resource')
      .select('title, raw_content, user_id')
      .eq('id', resourceId)
      .single()

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 })
    }

    // Sécurité RLS au niveau applicatif
    if (resource.user_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Non autorisé à lire ce document' }, { status: 403 })
      }
    }

    if (!resource.raw_content || !resource.raw_content.trim()) {
      return NextResponse.json({ error: 'Cette ressource ne contient pas de texte' }, { status: 400 })
    }

    // 4. Définition des prompts
    let systemPrompt = ''
    let userPrompt = ''

    if (action === 'summarize') {
      systemPrompt = `Tu es NexaMind AI, un assistant d'entreprise intelligent pour NexaWorks.
Ton rôle est de rédiger un résumé exécutif extrêmement clair, fluide et structuré en français du document fourni.
Structure le résumé avec des titres pertinents en Markdown (avec des sauts de ligne clairs).`
      userPrompt = `Voici le titre du document : "${resource.title}".
Voici le contenu du document à résumer :
---
${resource.raw_content}
---
Génère le résumé structuré en français.`
    } else if (action === 'extract_points') {
      systemPrompt = `Tu es NexaMind AI, un assistant d'entreprise intelligent pour NexaWorks.
Ton rôle est d'analyser le document fourni pour en extraire les points clés sous forme de liste à puces en français.
Identifie et structure clairement :
1. Les décisions prises.
2. Les actions à mener (avec responsable si mentionné).
3. Les échéances clés (dates limites).`
      userPrompt = `Voici le titre du document : "${resource.title}".
Voici le contenu du document à analyser :
---
${resource.raw_content}
---
Extrais les points clés en français selon la structure demandée.`
    }

    // 5. Appel de l'IA
    const model = openrouter(modelName)
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    })

    return NextResponse.json({ result: text })

  } catch (error) {
    console.error('Erreur API process resource:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
