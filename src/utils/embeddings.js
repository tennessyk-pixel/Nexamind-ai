/**
 * Génération d'embeddings via l'Edge Function Supabase `embed`, qui utilise le
 * modèle gte-small intégré à Supabase (384 dimensions, pooling moyen + normalisation).
 *
 * Le modèle tournait auparavant en local via @xenova/transformers, ce qui ne peut pas
 * fonctionner sur Netlify (binaires natifs + téléchargement du modèle au démarrage).
 * Les vecteurs produits ici sont compatibles avec ceux déjà stockés en base
 * (mêmes résultats de recherche, dans le même ordre).
 *
 * Usage strictement côté serveur : la clé service_role ne doit jamais être exposée au navigateur.
 */

export async function getEmbedding(text) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY"
    )
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/embed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Edge Function embed — erreur ${response.status} : ${await response.text()}`)
  }

  const { embedding, error } = await response.json()

  if (error) {
    throw new Error(`Edge Function embed : ${error}`)
  }

  if (!Array.isArray(embedding) || embedding.length !== 384) {
    throw new Error(`Embedding invalide (attendu 384 dimensions, reçu ${embedding?.length})`)
  }

  return embedding
}
