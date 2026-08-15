-- =====================================================================
--  NexaMind AI — storage.sql
--  Configuration du Storage Supabase pour les documents utilisateurs
-- =====================================================================

-- 1. Création du Bucket "resources"
-- Il est privé (public = false) pour protéger les documents d'entreprise.
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'resources',
  'resources',
  false, -- Privé (accessible uniquement via RLS)
  20971520 -- Limite de 20 Mo (en bytes) alignée avec le RM-007
) on conflict (id) do nothing;

-- =====================================================================
--  Politiques RLS (Row Level Security) sur storage.objects
--  On s'assure qu'un utilisateur ne peut voir, uploader ou supprimer
--  que SES propres fichiers.
-- =====================================================================

-- Activer le RLS sur storage.objects (normalement déjà fait par Supabase, donc on ne force pas l'alter table pour éviter l'erreur de permission)
-- alter table storage.objects enable row level security;

-- 1. Autoriser l'upload (INSERT) de ses propres fichiers
create policy "Les utilisateurs authentifiés peuvent uploader des fichiers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resources' and 
    auth.uid() = owner
  );

-- 2. Autoriser la lecture (SELECT) de ses propres fichiers
create policy "Les utilisateurs peuvent lire leurs propres fichiers"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resources' and 
    auth.uid() = owner
  );

-- 3. Autoriser la suppression (DELETE) de ses propres fichiers
create policy "Les utilisateurs peuvent supprimer leurs propres fichiers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resources' and 
    auth.uid() = owner
  );

-- 4. Autoriser la mise à jour (UPDATE) de ses propres fichiers
create policy "Les utilisateurs peuvent mettre à jour leurs propres fichiers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resources' and 
    auth.uid() = owner
  );
