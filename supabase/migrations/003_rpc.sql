-- =====================================================================
--  NexaMind AI — 003_rpc.sql
-- =====================================================================

-- --- match_chunks (Recherche vectorielle RAG) ---
create or replace function match_chunks(
  query_embedding vector(384),
  match_threshold float default 0.7,
  match_count int default 5
) returns table (
  chunk_id uuid,
  resource_id uuid,
  resource_title text,
  content text,
  similarity float
) language sql stable as $$
  select 
    c.id as chunk_id, 
    r.id as resource_id, 
    r.title as resource_title, 
    c.content, 
    1 - (c.embedding <=> query_embedding) as similarity 
  from chunk c 
  join resource r on r.id = c.resource_id 
  where r.index_status = 'ready' 
    and r.is_active = true 
    and 1 - (c.embedding <=> query_embedding) > match_threshold 
  order by c.embedding <=> query_embedding 
  limit match_count; 
$$;

-- --- get_related_resources (Suggestion documents associés) ---
create or replace function get_related_resources(
  source_resource_id uuid,
  match_count int default 5
) returns table (
  resource_id uuid,
  title text,
  source_type text,
  max_similarity float
) language sql stable as $$
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

-- --- get_resource_chunks (Récupération texte complet d'une ressource) ---
create or replace function get_resource_chunks(
  target_resource_id uuid
) returns table (
  content text,
  chunk_index int
) language sql stable as $$
  select 
    c.content, 
    c.chunk_index 
  from chunk c 
  join resource r on r.id = c.resource_id 
  where c.resource_id = target_resource_id 
    and r.index_status = 'ready' 
    and r.is_active = true 
  order by c.chunk_index; 
$$;
