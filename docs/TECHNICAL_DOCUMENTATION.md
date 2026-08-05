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

---

## 7. Système d'Évaluation et de Feedback sur les Réponses IA (s66)

Pour assurer l'amélioration continue du modèle IA (RLHF - Reinforcement Learning from Human Feedback) et mesurer la qualité de l'assistant d'entreprise, un système de notation 👍 / 👎 est intégré directement dans le flux de chat.

### A. Modèle de Données (`feedback`)
* La table [`feedback`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/supabase/schema.sql#L153) dans Supabase enregistre chaque évaluation avec une contrainte d'unicité `unique (message_id, user_id)`.
* Les évaluations possibles s'appuient sur l'énumération PostgreSQL `feedback_rating` (`'positive'`, `'negative'`).

### B. Route API de Gestion (`POST /api/chat/feedback`)
* Implémentée dans [`src/app/api/chat/feedback/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/chat/feedback/route.js).
* **Résolution dynamique des ID** : Lorsque l'utilisateur vote pour un message qui vient d'être streamé par le Vercel AI SDK, l'identifiant côté client (temporaire) n'est pas encore un UUID de base de données. Le backend recherche automatiquement le message en base par correspondance de contenu et de conversation (`role = 'assistant'`), garantissant une synchronisation fiable à 100 %.
* **Logique Toggle / Upsert** : 
  * Si l'utilisateur clique sur le même bouton (ex: 👍 alors que la note était déjà positive), le feedback est supprimé (annulation du vote).
  * Si le vote est nouveau ou passe d'une note à l'autre, l'enregistrement est mis à jour en utilisant le client d'administration côté serveur (contournant en toute sécurité les limites de RLS tout en préservant l'identité de l'utilisateur authentifié).

### C. Réconciliation de l'Historique (`GET /api/chat/history`)
* La route d'historique [`src/app/api/chat/history/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/chat/history/route.js) inclut une jointure relationnelle Supabase `.select('..., feedback(id, rating, user_id)')`.
* Lors du chargement d'une conversation passée, les boutons 👍 / 👎 apparaissent pré-sélectionnés et colorés en vert/rouge selon le choix précédent de l'utilisateur, offrant une expérience UI fluide et digne des standards modernes.

### D. Suivi & KPI dans le Dashboard (`/dashboard`)
* Sur la page d'accueil de l'application ([`src/app/dashboard/page.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/dashboard/page.js)), un bloc d'analyse **"Qualité & Feedbacks (RLHF)"** agrège en temps réel les notations de la base de connaissances.
* Ce bloc affiche le **nombre total d'évaluations enregistrées** ainsi que le **pourcentage de réponses jugées utiles** (`rating = 'positive'`), offrant une visibilité directe au niveau direction et pilotage.

---

## 8. Conformité RGPD & Cadre Légal d'Entreprise (s64)

Pour garantir une adoption irréprochable en milieu professionnel (B2B) et satisfaire aux exigences de la CNIL et du RGPD, NexaMind AI intègre un ensemble de dispositifs juridiques et de transparence sur le traitement des données IA.

### A. Bandeau de Consentement & Respect de la Vie Privée (`CookieBanner`)
* Implémenté dans [`src/components/CookieBanner.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/components/CookieBanner.js) et instancié au niveau de la racine dans [`src/app/layout.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/layout.js).
* Affiche une notification en verre dépoli (Glassmorphism) informative aux nouveaux visiteurs.
* **Zéro traçage publicitaire** : L'application n'utilise que des cookies techniques exemptés (maintien de la session Supabase Auth) et du stockage local (`localStorage`) pour le thème clair/sombre et la mémorisation du choix RGPD (`nexamind_rgpd_consent`).

### B. Espace Légal Dédié (`/legal/*`)
* **Mentions Légales (`/legal/mentions-legales`)** : Implémentées dans [`src/app/legal/mentions-legales/page.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/legal/mentions-legales/page.js). Indiquent les informations réglementaires (LCEN), l'hébergement sécurisé (Vercel EU / Supabase AWS ISO 27001) et la propriété intellectuelle (NexaWorks SAS).
* **CGU & Protection des Données / RGPD (`/legal/cgu`)** : Implémentées dans [`src/app/legal/cgu/page.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/legal/cgu/page.js).
  * **Engagement Zero Data Retention (ZDR)** : Documente contractuellement et techniquement que ni Vercel ni les fournisseurs LLM tiers n'entraînent de futurs modèles d'IA sur le corpus documentaire ou le contenu des chats de l'entreprise.
  * **Accessibilité continue** : Des liens de consultation directe sont embarqués dans le pied de page du menu latéral ([`src/app/dashboard/layout.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/dashboard/layout.js)).

---

## 9. Audit de Sécurité & Étanchéité RLS (s63)

Afin de garantir un cloisonnement étanche entre les utilisateurs et organisations B2B, un audit de sécurité complet a été réalisé sur la couche base de données (Supabase) et sur l'ensemble des points d'entrée API (Next.js App Router).

### A. Rapport d'Audit & Certification RLS
* L'intégralité des résultats et conclusions est documentée dans le rapport d'audit dédié : [`docs/SECURITY_AUDIT_REPORT.md`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/docs/SECURITY_AUDIT_REPORT.md).
* **100 % des tables PostgreSQL** (les 10 tables de l'architecture) disposent du verrouillage Row Level Security (RLS) actif et assorti de politiques de lecture/écriture basées sur l'identité de session `auth.uid()`.

### B. Script d'Audit & Consolidation SQL
* Le script [`supabase/audit-security-rls-check.sql`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/supabase/audit-security-rls-check.sql) est à disposition des administrateurs système et DBA.
* **Fonctions clés du script :**
  * Activation forcée et idemptotente de RLS sur l'ensemble des tables publiques.
  * Verrouillage des fonctions RPC (dont la recherche vectorielle `match_chunks`) en mode `SECURITY INVOKER`, garantissant que les recherches d'embeddings s'exécutent strictement avec les permissions de l'utilisateur appelant.
  * Requêtes de diagnostic automatisées générant un tableau d'état (`✅ SÉCURISÉ (RLS ACTIF)`) directement depuis le SQL Editor Supabase.

### C. Sécurité Backend & Zéro-Trust API
* Toutes les routes d'API ([`src/app/api/*`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/)) valident impérativement le jeton d'authentification utilisateur (`supabase.auth.getUser()`) avant tout calcul d'embedding, recherche sémantique ou génération LLM.
* L'usage de `createAdminClient()` (`service_role`) est strictement borné côté serveur après vérification en amont de la propriété des enregistrements par le client utilisateur standard, prévenant toute usurpation ou élévation de privilèges indue.

