import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { pipeline } from '@xenova/transformers'

let extractor = null
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/gte-small')
  }
  return extractor
}

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { query } = await req.json()
    if (!query) {
      return NextResponse.json({ error: 'Recherche vide' }, { status: 400 })
    }

    // Embed the query
    const extract = await getExtractor()
    const output = await extract(query, { pooling: 'mean', normalize: true })
    const queryEmbedding = Array.from(output.data)

    // Call match_chunks
    const { data: matchedChunks, error: matchError } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 10 // Get top 10 chunks
    })

    if (matchError) {
      throw matchError
    }

    // Insert search query history
    const adminClient = createAdminClient()
    await adminClient.from('search_query').insert({
      user_id: user.id,
      query_text: query,
      results_count: matchedChunks?.length || 0
    })

    return NextResponse.json({ results: matchedChunks || [] })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
