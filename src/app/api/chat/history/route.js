import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req) {
  try {
    // 1. Vérification de l'authentification
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupération de l'ID de conversation
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId manquant' }, { status: 400 })
    }

    // 3. Récupération des messages et des citations associées
    const { data: dbMessages, error: fetchError } = await supabase
      .from('message')
      .select(`
        id,
        role,
        content,
        has_context,
        created_at,
        citation (
          id,
          relevance_score,
          resource (
            id,
            title
          )
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      throw fetchError
    }

    // 4. Formater les messages pour le format attendu par le frontend
    const formattedMessages = dbMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      has_context: msg.has_context,
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: msg.citation?.map(cit => ({
        id: cit.id,
        title: cit.resource?.title || 'Document inconnu',
        resource_id: cit.resource?.id,
        similarity: cit.relevance_score
      })) || []
    }))

    return NextResponse.json({ messages: formattedMessages })

  } catch (error) {
    console.error('Erreur API Chat History:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
