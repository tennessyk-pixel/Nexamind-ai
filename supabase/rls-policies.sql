-- =====================================================================
--  NexaMind AI — rls-policies.sql
--  Row Level Security — toutes les tables MVP.
--  Chaque policy est reliée à sa règle métier (RM-XXX) et/ou sa
--  décision de journal (JD-XX).
--  Convention : une policy par opération par table.
--  USING = filtre les lignes existantes (SELECT, UPDATE, DELETE).
--  WITH CHECK = valide les nouvelles données (INSERT, UPDATE).
-- =====================================================================

-- --- Fonction utilitaire : vérifier le rôle métier admin ---
-- Le rôle métier est dans profiles.role, pas dans le JWT.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
--  1. profiles — RM-001 (isolation par utilisateur)
-- =====================================================================
alter table profiles enable row level security;

-- Tout authentifié peut lire les profils (nom affiché dans les citations, etc.)
create policy "profiles_select_all"
  on profiles for select
  to authenticated
  using (true);

-- Chacun ne modifie que son propre profil
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Un admin peut modifier le rôle de n'importe qui
create policy "profiles_update_admin"
  on profiles for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Pas de INSERT direct : géré par le trigger handle_new_user (RM-010)
-- Pas de DELETE : un profil n'est jamais supprimé directement

-- =====================================================================
--  2. resource — RM-001 + RM-003 + RM-004
-- =====================================================================
alter table resource enable row level security;

-- Tout authentifié peut voir les ressources prêtes et actives (RM-003)
create policy "resource_select_ready"
  on resource for select
  to authenticated
  using (index_status = 'ready' and is_active = true);

-- Le propriétaire voit aussi ses ressources non-ready (pour suivre l'indexation)
create policy "resource_select_own"
  on resource for select
  to authenticated
  using (user_id = auth.uid());

-- Tout authentifié peut ajouter une ressource
create policy "resource_insert_auth"
  on resource for insert
  to authenticated
  with check (user_id = auth.uid());

-- Le propriétaire peut modifier sa ressource (dont soft delete via is_active)
create policy "resource_update_own"
  on resource for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- L'admin peut modifier toute ressource (gestion du corpus)
create policy "resource_update_admin"
  on resource for update
  to authenticated
  using (is_admin());

-- Pas de DELETE : soft delete uniquement (RM-004, JD-08)

-- =====================================================================
--  3. chunk — RM-001 + RM-003
--  Les chunks ne sont jamais manipulés directement par le client.
--  Ils sont lus via la fonction RPC match_chunks (voir rpc-functions.sql).
--  On pose quand même des policies SELECT pour la sécurité en profondeur.
-- =====================================================================
alter table chunk enable row level security;

-- Tout authentifié peut lire les chunks (la recherche vectorielle en a besoin)
-- Filtrage fin = côté RPC (ne retourne que les chunks de ressources ready+active)
create policy "chunk_select_auth"
  on chunk for select
  to authenticated
  using (true);

-- INSERT/UPDATE/DELETE réservés au service_role (pipeline d'ingestion côté serveur)
-- Aucune policy INSERT/UPDATE/DELETE pour authenticated = bloqué par défaut (RLS active)

-- =====================================================================
--  4. category — lecture ouverte, écriture admin
-- =====================================================================
alter table category enable row level security;

create policy "category_select_all"
  on category for select
  to authenticated
  using (true);

create policy "category_insert_admin"
  on category for insert
  to authenticated
  with check (is_admin());

create policy "category_update_admin"
  on category for update
  to authenticated
  using (is_admin());

-- =====================================================================
--  5. resource_category — lecture ouverte, écriture par le propriétaire
--     de la ressource
-- =====================================================================
alter table resource_category enable row level security;

create policy "resource_category_select_all"
  on resource_category for select
  to authenticated
  using (true);

create policy "resource_category_insert_owner"
  on resource_category for insert
  to authenticated
  with check (
    exists (
      select 1 from resource
      where id = resource_id and user_id = auth.uid()
    )
  );

create policy "resource_category_delete_owner"
  on resource_category for delete
  to authenticated
  using (
    exists (
      select 1 from resource
      where id = resource_id and user_id = auth.uid()
    )
  );

-- =====================================================================
--  6. conversation — RM-001 (isolation stricte)
-- =====================================================================
alter table conversation enable row level security;

create policy "conversation_select_own"
  on conversation for select
  to authenticated
  using (user_id = auth.uid());

create policy "conversation_insert_own"
  on conversation for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "conversation_update_own"
  on conversation for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =====================================================================
--  7. message — RM-001 (via la conversation parente)
-- =====================================================================
alter table message enable row level security;

create policy "message_select_own"
  on message for select
  to authenticated
  using (
    exists (
      select 1 from conversation
      where id = conversation_id and user_id = auth.uid()
    )
  );

create policy "message_insert_own"
  on message for insert
  to authenticated
  with check (
    exists (
      select 1 from conversation
      where id = conversation_id and user_id = auth.uid()
    )
  );

-- Pas d'UPDATE ni DELETE sur les messages (immuables)

-- =====================================================================
--  8. citation — RM-001 (via le message parent → conversation)
-- =====================================================================
alter table citation enable row level security;

create policy "citation_select_own"
  on citation for select
  to authenticated
  using (
    exists (
      select 1 from message m
      join conversation c on c.id = m.conversation_id
      where m.id = message_id and c.user_id = auth.uid()
    )
  );

-- INSERT réservé au service_role (le pipeline RAG crée les citations côté serveur)
-- Pas d'UPDATE ni DELETE (immuables)

-- =====================================================================
--  9. search_query — RM-001 (isolation stricte)
-- =====================================================================
alter table search_query enable row level security;

create policy "search_query_select_own"
  on search_query for select
  to authenticated
  using (user_id = auth.uid());

create policy "search_query_insert_own"
  on search_query for insert
  to authenticated
  with check (user_id = auth.uid());

-- =====================================================================
-- 10. feedback — RM-001 + RM-006 (un seul par couple message/user)
-- =====================================================================
alter table feedback enable row level security;

create policy "feedback_select_own"
  on feedback for select
  to authenticated
  using (user_id = auth.uid());

create policy "feedback_insert_own"
  on feedback for insert
  to authenticated
  with check (user_id = auth.uid());
  -- RM-006 : la contrainte UNIQUE(message_id, user_id) dans le schema
  -- empêche le doublon au niveau base, pas besoin de le vérifier ici.

-- Pas d'UPDATE ni DELETE sur les feedbacks (un avis donné est définitif en MVP)
