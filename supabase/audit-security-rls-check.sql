-- =====================================================================
--  NexaMind AI — audit-security-rls-check.sql (Séquence s63)
--  Script de consolidation et d'audit à 360° de la sécurité RLS Supabase.
--  À exécuter dans l'éditeur SQL de Supabase pour vérifier et verrouiller
--  strictement l'isolation des données entre les utilisateurs d'entreprise.
-- =====================================================================

-- =====================================================================
-- 1. CONSOLIDATION FORCÉE : ACTIVATION DE RLS SUR TOUTES LES TABLES
--     Garantit qu'aucune table n'a pu être oubliée lors de l'évolution
--     du schéma (ex: ajout ultérieur de la table feedback ou citation).
-- =====================================================================
do $$ 
declare
    t text;
    tables text[] := ARRAY[
        'profiles',
        'resource',
        'chunk',
        'category',
        'resource_category',
        'conversation',
        'message',
        'citation',
        'search_query',
        'feedback'
    ];
begin
    foreach t in array tables loop
        if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
            execute format('alter table public.%I enable row level security;', t);
            raise notice '🔒 RLS vérifié et actif pour la table: %', t;
        end if;
    end loop;
end $$;

-- =====================================================================
-- 2. VERROUILLAGE DES FONCTIONS RPC EN MODE SECURITY INVOKER
--     Garantit que les recherches vectorielles (match_chunks) et les
--     analyses sémantiques sont exécutées AVEC les privilèges de RLS 
--     de l'utilisateur appelant, empêchant la fuite de données inter-clients.
-- =====================================================================
alter function if exists public.match_chunks(vector, float, int) security invoker;
alter function if exists public.get_related_resources(uuid, int) security invoker;
alter function if exists public.get_resource_chunks(uuid) security invoker;

-- =====================================================================
-- 3. REQUÊTE D'AUDIT 1 : ÉTAT DES VERROUS RLS PAR TABLE
--     Affiche un tableau de diagnostic dans le Dashboard Supabase.
-- =====================================================================
select 
    c.relname as table_name, 
    c.relrowsecurity as rls_enabled,
    case 
        when c.relrowsecurity = true then '✅ SÉCURISÉ (RLS ACTIF)'
        else '🚨 VULNERABLE (PAS DE RLS)'
    end as security_status,
    count(p.policyname) as active_policies_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.tablename = c.relname and p.schemaname = 'public'
where n.nspname = 'public' 
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relname;

-- =====================================================================
-- 4. REQUÊTE D'AUDIT 2 : MATRICE DÉTAILLÉE DES POLITIQUES RLS
--     Détaille pour chaque table le type d'opération (SELECT, INSERT, etc.)
--     et la condition SQL appliquée (ex: user_id = auth.uid()).
-- =====================================================================
select 
    tablename as table, 
    policyname as nom_politique, 
    cmd as operation, 
    roles, 
    qual as condition_lecture_select, 
    with_check as condition_ecriture_insert_update
from pg_policies 
where schemaname = 'public'
order by tablename, cmd;
