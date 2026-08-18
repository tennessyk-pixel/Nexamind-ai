import { createOpenAI } from '@ai-sdk/openai'

/**
 * Client OpenRouter partagé, avec bascule automatique entre modèles.
 *
 * Les endpoints gratuits d'OpenRouter sont régulièrement saturés ou retirés :
 * une requête peut échouer (`Provider returned error`) alors que le même modèle
 * répondait normalement la minute d'avant. OpenRouter accepte un champ `models`
 * listant des modèles par ordre de préférence et bascule tout seul sur le
 * suivant quand l'un d'eux est indisponible.
 *
 * Le SDK n'expose pas ce champ, on l'injecte donc dans le corps de la requête
 * via un `fetch` personnalisé.
 *
 * Le modèle principal vient de NEXT_PUBLIC_AI_MODEL — ne jamais le coder en dur :
 * les modèles gratuits disparaissent sans préavis, et seule une variable
 * d'environnement permet d'en changer sans redéployer le code.
 */

export const primaryModel = process.env.NEXT_PUBLIC_AI_MODEL

// Replis vérifiés fonctionnels le 2026-08-13. Si le chat tombe en panne
// durablement, vérifier la liste à jour sur https://openrouter.ai/models?q=free
const fallbackModels = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
]

const modelChain = [primaryModel, ...fallbackModels].filter(
  (model, index, all) => model && all.indexOf(model) === index
)

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: 'compatible',
  fetch: async (url, options) => {
    if (options?.body && typeof options.body === 'string') {
      try {
        const body = JSON.parse(options.body)
        body.models = modelChain
        options = { ...options, body: JSON.stringify(body) }
      } catch {
        // Corps non-JSON : on laisse la requête passer telle quelle.
      }
    }
    return fetch(url, options)
  },
})
