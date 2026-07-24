-- =====================================================================
--  NexaMind AI — rpc-functions.sql
--  Fonctions RPC Supabase (appelables via POST /rest/v1/rpc/<nom>).
--  Chaque fonction est justifiée : elle touche plusieurs tables en une
--  transaction, ou applique une règle trop complexe pour une policy RLS.
-- =====================================================================

-- =====================================================================
--  match_chunks — Recherche vectorielle (cœur du RAG)
--  Appelée par le back Next.js quand l'utilisateur pose une question.
--  Retourne les N chunks les plus proches sémantiquement de la question,
--  uniquement parmi les ressources ready + actives (RM-003).
-- =====================================================================
create or replace function match_chunks(
  query_embedding vector,              -- vector sans (384) : pgvector n'applique pas
  match_threshold float default 0.7,   -- le typmod sur les paramètres de fonction.
  match_count int default 5            -- La validation se fait via le CHECK ci-dessous.
)
returns table (
  chunk_id uuid,
  resource_id uuid,
  resource_title text,
  content text,
  similarity float
)
language plpgsql
stable
as $$
begin
  -- Validation stricte de la dimension (384 = gte-small, JD-11)
  if vector_dims(query_embedding) != 384 then
    raise exception 'query_embedding doit avoir 384 dimensions (reçu: %)', vector_dims(query_embedding);
  end if;

  return query
  select
    c.id as chunk_id,
    r.id as resource_id,
    r.title as resource_title,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from chunk c
  join resource r on r.id = c.resource_id
  where r.index_status = 'ready'        -- RM-003
    and r.is_active = true              -- RM-003 + RM-004
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- =====================================================================
--  get_related_resources — Suggestion de ressources liées
--  Appelée sur le détail d'une ressource pour afficher « Documents en rapport ».
--  Cherche les ressources dont les chunks sont proches de ceux de la
--  ressource courante, hors elle-même.
-- =====================================================================
create or replace function get_related_resources(
  source_resource_id uuid,
  match_count int default 5
)
returns table (
  resource_id uuid,
  title text,
  source_type text,
  max_similarity float
)
language sql
stable
as $$
  select
    r.id as resource_id,
    r.title,
    r.source_type::text,
    max(1 - (c2.embedding <=> c1.embedding)) as max_similarity
  from chunk c1
  join chunk c2 on c2.resource_id != c1.resource_id
  join resource r on r.id = c2.resource_id
  where c1.resource_id = source_resource_id
    and r.index_status = 'ready'
    and r.is_active = true
  group by r.id, r.title, r.source_type
  order by max_similarity desc
  limit match_count;
$$;

-- =====================================================================
--  get_resource_chunks — Récupérer le texte complet d'une ressource
--  Utilisé pour le résumé automatique (US-06) et l'extraction des
--  points clés (US-07) : on recompose le texte à partir des chunks
--  ordonnés, puis on l'envoie au LLM.
-- =====================================================================
create or replace function get_resource_chunks(
  target_resource_id uuid
)
returns table (
  content text,
  chunk_index int
)
language sql
stable
as $$
  select c.content, c.chunk_index
  from chunk c
  join resource r on r.id = c.resource_id
  where c.resource_id = target_resource_id
    and r.index_status = 'ready'
    and r.is_active = true
  order by c.chunk_index;
$$;
