-- =====================================================================
--  NexaMind AI — seed.sql
--  Jeu de données de test MVP.
--  Prérequis : créer d'abord 3 comptes via Supabase Auth (email+mdp ou
--  API admin) — le trigger handle_new_user() crée alors leur profil
--  automatiquement (RM-010).
-- =====================================================================

-- --- Remplacer par les vrais UUID auth.users après création des comptes ---
-- Nadia   (nouvelle arrivante) : 'a4f4c03b-1d71-410f-b09f-f0b123a0dfb4'
-- Marc    (confirmé)           : '61202c6e-3f54-458a-8a31-5531c2a62851'
-- Sonia   (admin / référente)  : 'f4998a8a-7700-4477-acfa-ac01ae09b9fd'

update profiles set role = 'admin', full_name = 'Sonia'
  where id = 'f4998a8a-7700-4477-acfa-ac01ae09b9fd';
update profiles set full_name = 'Nadia'
  where id = 'a4f4c03b-1d71-410f-b09f-f0b123a0dfb4';
update profiles set full_name = 'Marc'
  where id = '61202c6e-3f54-458a-8a31-5531c2a62851';

-- --- Catégories ---
insert into category (id, name, color) values
  ('a1000000-0000-0000-0000-000000000001','Onboarding','#6366F1'),
  ('a1000000-0000-0000-0000-000000000002','Facturation','#8B5CF6'),
  ('a1000000-0000-0000-0000-000000000003','Procédures','#22D3EE');

-- --- Ressources : un cas par statut (RM-002/003/004) ---
insert into resource (id, user_id, title, description, source_type, file_type, file_size, raw_content, index_status, is_active) values
  ('b1000000-0000-0000-0000-000000000001','f4998a8a-7700-4477-acfa-ac01ae09b9fd',
   'Procédure de facturation client','Étapes pour établir une facture','procedure','pdf', 245000,
   'Pour facturer un client : 1) ouvrir le dossier projet 2) vérifier le devis signé 3) générer la facture dans l''outil comptable...',
   'ready', true),
  ('b1000000-0000-0000-0000-000000000002','f4998a8a-7700-4477-acfa-ac01ae09b9fd',
   'FAQ onboarding nouveaux arrivants','Questions fréquentes des nouveaux','faq','md', 18000,
   'Où trouver le modèle de compte rendu ? Dans le dossier Templates > CR_reunion. Comment demander un accès ?...',
   'ready', true),
  ('b1000000-0000-0000-0000-000000000003','61202c6e-3f54-458a-8a31-5531c2a62851',
   'Compte rendu — Client Atlas, Q2','Réunion de suivi trimestriel','compte_rendu','docx', 89000,
   'Présents : Marc, client Atlas. Décisions : report du livrable de 2 semaines, budget additionnel validé...',
   'ready', true),
  ('b1000000-0000-0000-0000-000000000004','f4998a8a-7700-4477-acfa-ac01ae09b9fd',
   'Note de réunion — Cadrage produit','En cours d''indexation','note','pdf', 120000, null,
   'processing', true), -- cas limite : en cours de traitement, pas encore interrogeable (RM-003)
  ('b1000000-0000-0000-0000-000000000005','f4998a8a-7700-4477-acfa-ac01ae09b9fd',
   'Ancienne procédure RH (obsolète)','Remplacée, archivée','procedure','pdf', 95000,
   'Ancienne version de la procédure de congés...', 'ready', false); -- soft delete (RM-004) : is_active=false

-- --- Chunks : uniquement pour les ressources 'ready' ET actives (RM-003) ---
-- Embeddings factices (vecteurs de test, PAS de vrais embeddings sémantiques :
-- à remplacer par de vrais appels gte-small lors de l'implémentation réelle).
insert into chunk (id, resource_id, content, embedding, chunk_index, token_count) values
  ('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001',
   'Pour facturer un client : ouvrir le dossier projet, vérifier le devis signé.',
   (select array_fill(0.01, array[384])::vector), 0, 24),
  ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000001',
   'Générer la facture dans l''outil comptable puis l''envoyer au client sous 48h.',
   (select array_fill(0.02, array[384])::vector), 1, 21),
  ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002',
   'Où trouver le modèle de compte rendu ? Dans Templates > CR_reunion.',
   (select array_fill(0.03, array[384])::vector), 0, 18),
  ('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000003',
   'Décisions : report du livrable de 2 semaines, budget additionnel validé.',
   (select array_fill(0.04, array[384])::vector), 0, 16);
-- Note : aucun chunk pour b...0004 (processing) ni b...0005 (archivée) : cas voulu.

-- --- Association ressources <-> catégories ---
insert into resource_category (resource_id, category_id) values
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003');

-- --- Conversation + messages (Nadia) : cas nominal avec contexte trouvé ---
insert into conversation (id, user_id, title) values
  ('d1000000-0000-0000-0000-000000000001','a4f4c03b-1d71-410f-b09f-f0b123a0dfb4',
   'Comment facturer un client ?');

insert into message (id, conversation_id, role, content, has_context) values
  ('e1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001',
   'user','Comment je facture un client ?', false),
  ('e1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000001',
   'assistant','Pour facturer un client : ouvrez le dossier projet, vérifiez le devis signé, puis générez la facture dans l''outil comptable.', true);

-- --- Citation de la réponse IA vers sa source ---
insert into citation (id, message_id, chunk_id, resource_id, relevance_score) values
  ('f1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 0.91);

-- --- Cas limite : question hors corpus -> pas de contexte trouvé (JD-03) ---
insert into conversation (id, user_id, title) values
  ('d1000000-0000-0000-0000-000000000002','61202c6e-3f54-458a-8a31-5531c2a62851',
   'Politique de télétravail ?');
insert into message (id, conversation_id, role, content, has_context) values
  ('e1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000002',
   'user','Quelle est la politique de télétravail ?', false),
  ('e1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000002',
   'assistant','Je n''ai pas trouvé d''information à ce sujet dans la base de connaissances.', false);
-- pas de citation ici : cohérent avec has_context = false

-- --- Recherches sémantiques (historique) ---
insert into search_query (id, user_id, query_text, results_count) values
  ('a2000000-0000-0000-0000-000000000001','61202c6e-3f54-458a-8a31-5531c2a62851','facturation client', 2),
  ('a2000000-0000-0000-0000-000000000002','a4f4c03b-1d71-410f-b09f-f0b123a0dfb4','modèle compte rendu', 1);

-- --- Feedback (un positif, un négatif — RM-006 : un seul par couple message/user) ---
insert into feedback (id, message_id, user_id, rating, comment) values
  ('a3000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002',
   'a4f4c03b-1d71-410f-b09f-f0b123a0dfb4','positive', null);
