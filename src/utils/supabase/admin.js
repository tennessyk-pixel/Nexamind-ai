import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase "admin" utilisant la clé service_role.
 * À utiliser UNIQUEMENT dans les Route Handlers (côté serveur)
 * pour les opérations qui nécessitent de contourner le RLS :
 * - Insertion de chunks (pipeline d'ingestion RAG)
 * - Insertion de citations (pipeline de chat)
 * - Mise à jour du statut d'indexation des ressources
 *
 * ⚠️  Ne JAMAIS exposer ce client côté client (navigateur).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Variables d\'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
