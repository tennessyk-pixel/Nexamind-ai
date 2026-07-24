-- =====================================================================
--  NexaMind AI — 002_rls.sql
-- =====================================================================

-- --- Fonction Utilitaire Admin ---
create or replace function is_admin() returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- --- 1. Profiles ---
alter table profiles enable row level security;
create policy "profiles_select_all" on profiles for select to authenticated using (true);
create policy "profiles_update_own" on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on profiles for update to authenticated using (is_admin()) with check (is_admin());

-- --- 2. Resource ---
alter table resource enable row level security;
create policy "resource_select_ready" on resource for select to authenticated using (index_status = 'ready' and is_active = true);
create policy "resource_select_own" on resource for select to authenticated using (user_id = auth.uid());
create policy "resource_insert_auth" on resource for insert to authenticated with check (user_id = auth.uid());
create policy "resource_update_own" on resource for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "resource_update_admin" on resource for update to authenticated using (is_admin());

-- --- 3. Chunk ---
alter table chunk enable row level security;
create policy "chunk_select_auth" on chunk for select to authenticated using (true);

-- --- 4. Category ---
alter table category enable row level security;
create policy "category_select_all" on category for select to authenticated using (true);
create policy "category_insert_admin" on category for insert to authenticated with check (is_admin());
create policy "category_update_admin" on category for update to authenticated using (is_admin());

-- --- 5. Resource_category ---
alter table resource_category enable row level security;
create policy "resource_category_select_all" on resource_category for select to authenticated using (true);
create policy "resource_category_insert_owner" on resource_category for insert to authenticated with check (
  exists ( select 1 from resource where id = resource_id and user_id = auth.uid() )
);
create policy "resource_category_delete_owner" on resource_category for delete to authenticated using (
  exists ( select 1 from resource where id = resource_id and user_id = auth.uid() )
);

-- --- 6. Conversation ---
alter table conversation enable row level security;
create policy "conversation_select_own" on conversation for select to authenticated using (user_id = auth.uid());
create policy "conversation_insert_own" on conversation for insert to authenticated with check (user_id = auth.uid());
create policy "conversation_update_own" on conversation for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- 7. Message ---
alter table message enable row level security;
create policy "message_select_own" on message for select to authenticated using (
  exists ( select 1 from conversation where id = conversation_id and user_id = auth.uid() )
);
create policy "message_insert_own" on message for insert to authenticated with check (
  exists ( select 1 from conversation where id = conversation_id and user_id = auth.uid() )
);

-- --- 8. Citation ---
alter table citation enable row level security;
create policy "citation_select_own" on citation for select to authenticated using (
  exists (
    select 1 from message m 
    join conversation c on c.id = m.conversation_id 
    where m.id = message_id and c.user_id = auth.uid()
  )
);

-- --- 9. Search_query ---
alter table search_query enable row level security;
create policy "search_query_select_own" on search_query for select to authenticated using (user_id = auth.uid());
create policy "search_query_insert_own" on search_query for insert to authenticated with check (user_id = auth.uid());

-- --- 10. Feedback ---
alter table feedback enable row level security;
create policy "feedback_select_own" on feedback for select to authenticated using (user_id = auth.uid());
create policy "feedback_insert_own" on feedback for insert to authenticated with check (user_id = auth.uid());
