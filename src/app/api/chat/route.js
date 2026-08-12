import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getEmbedding } from '@/utils/embeddings'
import { openrouter, primaryModel as modelName } from '@/utils/openrouter'

// La réponse est streamée : la fonction reste ouverte pendant toute la
// génération, qui peut dépasser les 10 s par défaut sur une réponse longue.
export const maxDuration = 60

export async function POST(req) {
  try {
    // 1. Vérification de l'authentification (Sécurité)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // TEMPORAIRE: Bypass auth pour le test
    // if (!user) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    // 2. Récupération des paramètres de la requête
    const { messages, conversationId } = await req.json()

    // Helper: extraire le texte d'un message (compatible SDK v3 content et v4 parts)
    function getMessageText(msg) {
      if (msg.content && typeof msg.content === 'string') return msg.content
      if (msg.parts) {
        return msg.parts.filter(p => p.type === 'text').map(p => p.text).join('')
      }
      return ''
    }

    // 3. Recherche sémantique (RAG)
    const lastUserMessage = messages[messages.length - 1]
    const lastUserText = getMessageText(lastUserMessage)
    let contextText = ''
    let citations = []

    if (lastUserMessage && lastUserMessage.role === 'user') {
      try {
        const queryEmbedding = await getEmbedding(lastUserText)

        // Appel RPC pour trouver les chunks pertinents
        const { data: matchedChunks, error: matchError } = await supabase.rpc('match_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 3
        })

        if (!matchError && matchedChunks && matchedChunks.length > 0) {
          contextText = matchedChunks
            .map((c, i) => `[Document ${i + 1}] Source: "${c.resource_title}"\nContenu: ${c.content}`)
            .join('\n\n')

          citations = matchedChunks.map(c => ({
            id: c.chunk_id,
            title: c.resource_title,
            resource_id: c.resource_id,
            similarity: c.similarity
          }))
        }
      } catch (err) {
        console.error('Erreur lors de la vectorisation de la question:', err)
      }
    }

    // BUG-01 FIX : Utiliser le client admin pour les insertions (contourne le RLS)
    const adminClient = createAdminClient()

    // 4. Enregistrement du message utilisateur dans la base de données
    if (conversationId && user) {
      // Vérifier ou créer la conversation
      const { data: convExists } = await adminClient
        .from('conversation')
        .select('id')
        .eq('id', conversationId)
        .single()

      if (!convExists) {
        await adminClient.from('conversation').insert({
          id: conversationId,
          user_id: user.id,
          title: lastUserText?.substring(0, 100) || 'Nouvelle conversation'
        })
      }

      // Insérer le message de l'utilisateur
      await adminClient.from('message').insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastUserText,
        has_context: false
      })
    }

    // BUG-04 FIX : Utiliser la variable d'env pour le modèle
    console.log('Model:', modelName)
    const model = openrouter(modelName)

    const systemPrompt = `Tu es NexaMind AI, un assistant d'entreprise intelligent développé pour NexaWorks.
Tu dois aider l'utilisateur de manière concise, experte et professionnelle.

Voici des extraits de documents internes de l'entreprise pour t'aider à répondre à la question de l'utilisateur :
---
${contextText || "Aucun document pertinent n'a été trouvé dans la base de connaissances pour cette question."}
---

Consignes STRICTES :
1. Réponds de manière claire et structurée. S'appuie prioritairement sur les documents ci-dessus.
2. Si les documents ne contiennent pas l'information nécessaire pour répondre à la question, réponds poliment que tu ne trouves pas cette information dans les documents internes de NexaWorks.
3. Lorsque tu cites une information issue d'un document, fais référence au numéro de document (ex: [Document 1] ou [Document 2]) dans ton texte pour que l'utilisateur sache d'où vient l'information.`

    console.log('Initiating streamText with Vercel AI SDK...')

    try {
      const modelMessages = messages.map(msg => {
        let textContent = ''
        if (msg.content && typeof msg.content === 'string') {
          textContent = msg.content
        } else if (msg.parts) {
          textContent = msg.parts
            .filter(p => p.type === 'text')
            .map(p => p.text)
            .join('')
        }
        return {
          role: msg.role,
          content: textContent
        }
      })

      // Retirer les messages d'accueil de l'assistant en début d'historique pour OpenRouter
      while (modelMessages.length > 0 && modelMessages[0].role === 'assistant') {
        modelMessages.shift()
      }

      const result = streamText({
        model,
        messages: modelMessages,
        system: systemPrompt,
        async onFinish({ text }) {
          console.log('Stream finished successfully. Text length:', text.length)
          // Enregistrer la réponse de l'assistant dans la DB
          if (conversationId) {
            try {
              const { data: insertedMsg, error: insertError } = await adminClient
                .from('message')
                .insert({
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: text,
                  has_context: citations.length > 0
                })
                .select()
                .single()

              if (insertError) {
                console.error('Error inserting assistant message:', insertError)
              }

              // Enregistrer les citations associées
              if (insertedMsg && citations.length > 0) {
                for (const cit of citations) {
                  await adminClient.from('citation').insert({
                    message_id: insertedMsg.id,
                    chunk_id: cit.id,
                    resource_id: cit.resource_id,
                    relevance_score: cit.similarity
                  })
                }
              }
            } catch (dbErr) {
              console.error('Database error in onFinish:', dbErr)
            }
          }
        }
      })

      console.log('Returning UI message stream response...')
      return result.toUIMessageStreamResponse()
    } catch (streamErr) {
      console.error('Error during streamText setup:', streamErr)
      throw streamErr
    }

  } catch (error) {
    console.error('Erreur API Chat globale:', error)
    return new Response(error.message, { status: 500 })
  }
}
