// Edge Function d'embedding — modèle gte-small intégré à Supabase (384 dimensions).
// Reproduit exactement le comportement de @xenova/transformers utilisé localement
// (pooling moyen + normalisation L2), pour rester compatible avec les vecteurs
// déjà stockés dans la base. Permet à la recherche sémantique de fonctionner
// depuis Netlify, où le modèle local ne peut pas tourner.

const session = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Paramètre "text" manquant' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const embedding = await session.run(text, { mean_pool: true, normalize: true })

    return new Response(JSON.stringify({ embedding }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
