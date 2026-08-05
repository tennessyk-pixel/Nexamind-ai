import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req) {
  try {
    // 1. Vérification de l'authentification
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 })
    }

    // 2. Extraction du corps de la requête
    const { messageId, conversationId, content, rating, comment } = await req.json()

    if (!rating || !['positive', 'negative'].includes(rating)) {
      return NextResponse.json({ error: 'Evaluation (positive/negative) invalide.' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    let targetMessageId = messageId

    // Vérification : si messageId n'est pas un UUID standard de la base, on le recherche dans la DB (cas des messages tout juste streamés)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(targetMessageId)) {
      if (!conversationId || !content) {
        return NextResponse.json({ error: 'Impossible de localiser le message (ID ou contexte manquant).' }, { status: 404 })
      }
      const { data: foundMsg, error: findError } = await adminClient
        .from('message')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('role', 'assistant')
        .eq('content', content)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError || !foundMsg) {
        return NextResponse.json({ error: 'Message correspondant introuvable en base.' }, { status: 404 })
      }
      targetMessageId = foundMsg.id
    }

    // 3. Enregistrement ou mise à jour du feedback (unique sur message_id, user_id)
    // Nous vérifions s'il y a déjà un feedback pour modifier sinon créer
    const { data: existingFeedback } = await adminClient
      .from('feedback')
      .select('id, rating')
      .eq('message_id', targetMessageId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingFeedback) {
      // Si l'utilisateur clique sur le même bouton, on supprime le feedback (toggle off)
      if (existingFeedback.rating === rating && !comment) {
        await adminClient.from('feedback').delete().eq('id', existingFeedback.id)
        return NextResponse.json({ success: true, action: 'removed', rating: null })
      } else {
        // Sinon on met à jour avec la nouvelle notation/commentaire
        const { error: updateError } = await adminClient
          .from('feedback')
          .update({ rating, comment, updated_at: new Date().toISOString() })
          .eq('id', existingFeedback.id)

        if (updateError) throw updateError
        return NextResponse.json({ success: true, action: 'updated', rating })
      }
    } else {
      // Nouveau feedback
      const { error: insertError } = await adminClient
        .from('feedback')
        .insert({
          message_id: targetMessageId,
          user_id: user.id,
          rating,
          comment: comment || null
        })

      if (insertError) throw insertError
      return NextResponse.json({ success: true, action: 'created', rating })
    }

  } catch (error) {
    console.error('Erreur API Feedback:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
