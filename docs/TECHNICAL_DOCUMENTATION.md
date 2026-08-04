# Documentation Technique — NexaMind AI (MVP)

Ce document décrit en détail l'architecture, la structure des données, les mécanismes de sécurité (RLS) et la logique du pipeline RAG de l'application NexaMind AI.

---

## 1. Architecture Générale (Full-Stack)

NexaMind AI est construit sur une architecture hybride moderne :
* **Front-End (Interface Utilisateur)** : Développé en Next.js (App Router, React). Utilise Tailwind CSS pour le style et Lucide React pour les icônes.
* **Back-End (Logiciel Métier/IA)** : Route handlers Next.js (APIs) qui orchestrent la communication avec la base de données et l'IA.
* **Database & Sécurité** : Supabase (PostgreSQL + extension `pgvector` pour le stockage des embeddings sémantiques).
* **Moteur d'IA (LLM)** : OpenRouter servant de passerelle vers le modèle gratuit `google/gemma-4-26b-a4b-it:free` en mode compatible.

---

## 2. Modèle de Données (Base de Données)

La base PostgreSQL comprend 10 tables clés (décrites dans [`schema.sql`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/schema.sql)) :

1. **`profiles`** : Informations complémentaires des comptes utilisateurs authentifiés. Liée à `auth.users` de Supabase.
2. **`resource`** : Les documents importés dans le système. La colonne `raw_content` stocke le texte brut extrait du fichier.
3. **`chunk`** : Morceaux de textes découpés depuis `resource.raw_content` et vectorisés (embeddings de 384 dimensions).
4. **`category`** & **`resource_category`** : Gestion des catégories et tags associés aux documents.
5. **`conversation`** : Historique des fils de discussion créés par les utilisateurs.
6. **`message`** : Historique individuel des échanges de questions/réponses au sein d'une conversation.
7. **`citation`** : Permet de lier un message de l'IA aux sources (`resource`) qui ont servi à construire la réponse.
8. **`search_query`** : Historique des recherches sémantiques effectuées par l'utilisateur.
9. **`feedback`** : Notes d'évaluation 👍/👎 sur les réponses de l'IA.

---

## 3. Sécurité d'Isolation (Row Level Security - RLS)

Chaque table est protégée par des politiques RLS strictes ([`rls-policies.sql`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/rls-policies.sql)) garantissant qu'un utilisateur ne peut accéder qu'à ses propres données :
* **Exemple sur `conversation`** :
  ```sql
  create policy "conversation_select_own"
    on conversation for select
    to authenticated
    using (user_id = auth.uid());
  ```
* **Client Admin** : Lors des phases asynchrones d'ingestion (RAG) ou d'insertion de citations, l'API utilise un client doté de la clé `service_role` (créé via `createAdminClient()`) pour contourner temporairement les verrous RLS de manière sécurisée côté serveur uniquement.

---

## 4. Fonctionnement du Pipeline RAG (Ingestion & Chat)

Le RAG (Retrieval-Augmented Generation) s'articule en deux étapes clés :

### Étape A : Ingestion & Indexation Sémantique ([`route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/ingest/route.js))
1. **Upload** : Le document (PDF, TXT, MD ou DOCX) est téléversé dans le bucket Supabase Storage `resources`.
2. **Extraction** : Le texte est extrait du fichier (utilisation de `unpdf` pour le format PDF).
3. **Chunking** : Le texte est découpé en morceaux d'environ 500 caractères avec un recouvrement (overlap) de 100 caractères pour conserver le contexte.
4. **Embedding** : Chaque morceau est converti en vecteur sémantique de 384 dimensions via le modèle `gte-small` (exécuté en local côté serveur grâce à `@xenova/transformers`).
5. **Stockage** : Les vecteurs sont insérés dans la table `chunk` avec la référence de la ressource parente.

### Étape B : Chat Conversationnel & Recherche Sémantique ([`route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/chat/route.js))
1. **Embedding de la Question** : La question de l'utilisateur est vectorisée en 384 dimensions.
2. **Recherche Vectorielle (RPC)** : Appel de la fonction SQL `match_chunks` qui calcule la distance cosinus entre la question et tous les chunks stockés en base :
  ```sql
  1 - (c.embedding <=> query_embedding) as similarity
  ```
3. **Prompt Injection** : Les chunks les plus proches (pertinence supérieure à un seuil défini) sont injectés comme contexte dans le prompt système du modèle.
4. **Génération de la Réponse** : Le LLM (Gemma 4 via OpenRouter) génère une réponse basée *exclusivement* sur ce contexte pour éviter toute hallucination.
5. **Citations** : Les identifiants des documents sources sont enregistrés dans la table `citation` et renvoyés à l'UI pour que l'utilisateur puisse cliquer dessus pour vérifier l'information.

---

## 5. Fonctionnalités de Traitement IA (Résumé & Points Clés)

Les fonctions phares de résumé (`s49`) et d'extraction de points clés (`s48`) utilisent la route API [`src/app/api/resources/process/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/resources/process/route.js) :
* Elle récupère le `raw_content` brut d'un document.
* Elle configure des instructions système spécifiques (soit résumer avec structure Markdown, soit extraire les décisions/actions/échéances sous forme de liste).
* Elle appelle l'IA et retourne le texte généré pour affichage dans la modale de l'interface.

---

## 6. Suggestion de ressources liées (s4a)

La fonctionnalité de suggestion de documents connexes permet à l'utilisateur de découvrir des connaissances similaires lors de la consultation d'un résumé ou de points clés.
* **Fonction RPC (`get_related_resources`)** :
  ```sql
  create or replace function get_related_resources(
    source_resource_id uuid,
    match_count int default 5
  )
  ```
  Cette fonction compare les chunks de la ressource active avec les chunks de toutes les autres ressources actives du corpus. Elle utilise la similarité cosinus (`1 - (c2.embedding <=> c1.embedding)`) et regroupe par ressource cible pour calculer la similarité maximale de contenu, éliminant ainsi les doublons et proposant les meilleures correspondances.
* **Intégration Client** :
  * Lors du déclenchement du traitement d'un document, la page de bibliothèque effectue un appel RPC `get_related_resources` en parallèle.
  * Les 3 meilleures suggestions sont affichées sous forme de cartes cliquables en bas de la modale de résultat.
  * Cliquer sur une suggestion charge instantanément le traitement IA associé à ce nouveau document de manière fluide et interactive.

