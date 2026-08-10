/**
 * Remote embedding utility — replaces local @xenova/transformers
 * Uses Hugging Face Inference API (free) with the same gte-small model (384 dims)
 * to stay compatible with existing vectors in the Supabase database.
 */

const HF_MODEL = 'Xenova/gte-small'
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`

/**
 * Generate an embedding vector for a given text using the Hugging Face Inference API.
 * Returns a 384-dimension float array, identical to the local @xenova/transformers output.
 *
 * @param {string} text — The text to embed
 * @returns {Promise<number[]>} — 384-dim embedding vector
 */
export async function getEmbedding(text) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Hugging Face embedding API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()

  // The API returns the raw tensor; for a single string input it's [[...384 floats...]]
  // We need to mean-pool and normalize to match gte-small behavior
  if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
    // result is shape [1, seq_len, 384] — we need to mean-pool over seq_len
    const tokenEmbeddings = result[0] // [seq_len, 384]
    const dim = tokenEmbeddings[0].length
    const meanPooled = new Array(dim).fill(0)

    for (const tokenVec of tokenEmbeddings) {
      for (let i = 0; i < dim; i++) {
        meanPooled[i] += tokenVec[i]
      }
    }

    // Mean
    for (let i = 0; i < dim; i++) {
      meanPooled[i] /= tokenEmbeddings.length
    }

    // L2 Normalize
    let norm = 0
    for (let i = 0; i < dim; i++) {
      norm += meanPooled[i] * meanPooled[i]
    }
    norm = Math.sqrt(norm)
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        meanPooled[i] /= norm
      }
    }

    return meanPooled
  }

  // If the API already returns a flat array (some models do this directly)
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result
  }

  // Fallback: flat array nested in one level
  if (Array.isArray(result) && Array.isArray(result[0]) && typeof result[0][0] === 'number') {
    return result[0]
  }

  throw new Error('Unexpected embedding API response format')
}
