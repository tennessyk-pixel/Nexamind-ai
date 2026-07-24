-- =====================================================================
--  NexaMind AI — schema.sql
--  Backend Supabase (PostgreSQL + pgvector)
--  Dérivé du L5 (Données) du dossier de conception. Périmètre : MVP.
--  Entités MVP : profiles, resource, chunk, category, resource_category,
--                conversation, message, citation, search_query, feedback
--  Reporté V2 : notification (l'info d'indexation est déjà portée par
--               resource.index_status → pas de table dédiée au MVP).
--  Convention : id uuid / created_at / updated_at sur chaque table,
--               sauf exceptions documentées juste au-dessus.
-- =====================================================================

-- --- Extensions -------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";      -- pgvector (embeddings RAG)

-- --- Types ENUM -------------------------------------------------------
create type user_role       as enum ('user', 'admin');
create type theme_pref       as enum ('light', 'dark', 'system');
create type source_type      as enum ('document','note','faq','procedure','compte_rendu','fiche_projet','autre');
create type file_type        as enum ('pdf','docx','txt','md','autre');
create type index_status     as enum ('pending','processing','ready','error'); -- RM-002
create type message_role     as enum ('user','assistant');
create type feedback_rating  as enum ('positive','negative');

-- =====================================================================
--  1. profiles — étend auth.users (pas de default sur id : id = auth.users.id)
-- =====================================================================
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  full_name         text,
  role              user_role   not null default 'user',   -- rôle MÉTIER (≠ rôle JWT)
  theme_preference  theme_pref  not null default 'system',
  is_active         boolean     not null default true,
  last_login_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =====================================================================
--  2. resource — un document/ressource du corpus
-- =====================================================================
create table resource (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade, -- auteur/importateur
  title         text not null,
  description   text,
  source_type   source_type not null,
  file_url      text,
  file_type     file_type,
  file_size     bigint check (file_size is null or file_size <= 20971520), -- RM-007 : max 20 Mo
  raw_content   text,
  index_status  index_status not null default 'pending',   -- RM-002 (calculé par le système)
  is_active     boolean not null default true,             -- RM-004 (soft delete)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =====================================================================
--  3. chunk — morceau vectorisé d'une ressource (cœur du RAG)
--  Exception convention : pas d'updated_at (un chunk est créé ou supprimé,
--  jamais modifié — la ré-indexation recrée les chunks).
-- =====================================================================
create table chunk (
  id            uuid primary key default gen_random_uuid(),
  resource_id   uuid not null references resource(id) on delete cascade,
  content       text not null,
  embedding     vector(384) not null,     -- gte-small (384 dims), JD-11
  chunk_index   int  not null,            -- position dans la ressource
  token_count   int,
  created_at    timestamptz not null default now(),
  unique (resource_id, chunk_index)
);

-- =====================================================================
--  4. category — catégorie/tag pour organiser les ressources
-- =====================================================================
create table category (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =====================================================================
--  5. resource_category — jonction N..N
--  Exception convention : pas d'id propre (clé composite) ni d'updated_at
--  (une association est créée ou supprimée, jamais modifiée).
-- =====================================================================
create table resource_category (
  resource_id  uuid not null references resource(id) on delete cascade,
  category_id  uuid not null references category(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (resource_id, category_id)
);

-- =====================================================================
--  6. conversation — un fil d'échange utilisateur ↔ IA
-- =====================================================================
create table conversation (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text,                       -- RM-005 : auto-généré depuis la 1re question si null
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =====================================================================
--  7. message — un message (question user ou réponse IA)
--  Exception convention : pas d'updated_at (un message est immuable).
-- =====================================================================
create table message (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversation(id) on delete cascade,
  role             message_role not null,
  content          text not null,
  token_count      int,
  has_context      boolean not null default false,  -- l'IA a-t-elle trouvé du contexte (RAG) ?
  created_at       timestamptz not null default now()
);

-- =====================================================================
--  8. citation — lien entre une réponse IA et ses sources (chunk/resource)
--  Exception convention : pas d'updated_at (immuable).
-- =====================================================================
create table citation (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references message(id)  on delete cascade,
  chunk_id     uuid not null references chunk(id)    on delete cascade,
  resource_id  uuid not null references resource(id) on delete cascade,
  relevance_score real,
  created_at   timestamptz not null default now()
);

-- =====================================================================
--  9. search_query — historique des recherches sémantiques
--  Exception convention : pas d'updated_at (immuable).
-- =====================================================================
create table search_query (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  query_text    text not null,
  results_count int,
  created_at    timestamptz not null default now()
);

-- =====================================================================
-- 10. feedback — retour 👍/👎 sur une réponse IA (Should)
--  RM-006 : un seul feedback par couple (message, utilisateur).
-- =====================================================================
create table feedback (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references message(id)    on delete cascade,
  user_id     uuid not null references profiles(id)   on delete cascade,
  rating      feedback_rating not null,
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (message_id, user_id)
);

-- =====================================================================
--  Index de performance
-- =====================================================================
create index idx_resource_user           on resource(user_id);
-- ressources réellement interrogeables par l'IA (RM-003) — index partiel
create index idx_resource_queryable       on resource(user_id)
  where index_status = 'ready' and is_active = true;
create index idx_chunk_resource           on chunk(resource_id);
-- recherche sémantique : index vectoriel HNSW (distance cosinus)
create index idx_chunk_embedding          on chunk using hnsw (embedding vector_cosine_ops);
create index idx_conversation_user        on conversation(user_id);
create index idx_message_conversation     on message(conversation_id);
create index idx_citation_message         on citation(message_id);
create index idx_search_query_user        on search_query(user_id);
create index idx_resource_category_cat    on resource_category(category_id);

-- =====================================================================
--  Trigger : updated_at automatique (sur les tables qui ont updated_at)
-- =====================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles      for each row execute function update_updated_at();
create trigger set_updated_at before update on resource      for each row execute function update_updated_at();
create trigger set_updated_at before update on category      for each row execute function update_updated_at();
create trigger set_updated_at before update on conversation  for each row execute function update_updated_at();
create trigger set_updated_at before update on feedback      for each row execute function update_updated_at();

-- =====================================================================
--  Trigger : création automatique du profil à l'inscription (RM-010)
--  Sans lui, un compte s'authentifie sans ligne profiles → les RLS
--  basées sur le rôle métier échouent silencieusement.
-- =====================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Nouvel utilisateur'),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
