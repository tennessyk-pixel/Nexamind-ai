'use server'

import { createClient } from '@/utils/supabase/server'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  
  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  return { success: true }
}

export async function signupAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  
  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Supabase auth settings might require email confirmation.
  // If session is created directly, success!
  if (data?.session) {
    return { success: true }
  } else {
    // Return a custom error object to show a message without redirecting
    return { error: 'Inscription réussie. Veuillez vérifier vos e-mails pour confirmer votre compte.' }
  }
}
