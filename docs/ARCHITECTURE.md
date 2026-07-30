# Architecture Technique & Modélisation — NexaMind AI

## 1. Vue d'Ensemble du Système
NexaMind AI adopte une **architecture monolithique fullstack serverless**, adossée à un **Backend-as-a-Service (BaaS) Supabase** et à l'API **OpenRouter** pour la couche d'intelligence artificielle.

```
+-------------------------------------------------------------+
|                     Navigateur Client                       |
|          (React / Tailwind / Next.js Client Side)           |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Next.js API Routes                     |
|                   (Hébergé sur Vercel)                      |
+-------+----------------------+-----------------------+------+
        |                      |                       |
        v                      v                       v
+-------+------+       +-------+-------+       +-------+------+
|  Supabase    |       |  Supabase     |       |  OpenRouter  |
|  Auth        |       |  Postgres/RLS |       |  API (LLM)   |
+--------------+       +-------+-------+       +--------------+
                               |
                               v
                       +-------+-------+
                       |  pgvector     |
                       |  (Embeddings) |
                       +---------------+
```

---

## 2. Pipeline RAG (Retrieval-Augmented Generation)
La logique de réponse sourcée s'articule en 6 étapes :
1. **Saisie :** L'utilisateur pose sa question en langage naturel sur le client Next.js.
2. **Vectorisation :** La question est envoyée à une **Edge Function Supabase** qui génère un embedding de **384 dimensions** à l'aide du modèle open-source **`gte-small`** (exécuté localement via ONNX Runtime sans coût d'API).
3. **Recherche sémantique :** Une requête est lancée sur PostgreSQL via la fonction RPC `match_chunks` pour comparer le vecteur de la question aux vecteurs stockés dans la table `chunk` (similarité cosinus).
4. **Filtrage :** Seuls les chunks appartenant à des ressources prêtes (`index_status = 'ready'`) et actives (`is_active = true`) sont renvoyés, respectant l'isolation RLS.
5. **Génération :** Le contexte extrait et la question sont injectés dans un prompt envoyé à **OpenRouter** (modèles `:free` comme Llama 3.3 70B).
6. **Restitution :** Le client reçoit la réponse en streaming et affiche les sources (citations cliquables) pointant vers la table `citation`.

---

## 3. Schéma de Base de Données
Le schéma comporte 10 tables gérées dans Supabase :

1. **`profiles` :** Profils utilisateurs étendus depuis `auth.users` (id, email, full_name, role, theme_preference, is_active).
2. **`resource` :** Documents sources du RAG (id, title, description, source_type, file_url, index_status, is_active).
3. **`chunk` :** Segments textuels vectorisés (id, resource_id, content, embedding vector(384), chunk_index, token_count).
4. **`category` & `resource_category` :** Tags de catégorisation documentaire.
5. **`conversation` & `message` :** Fils d'échanges chat.
6. **`citation` :** Table d'association liant les réponses IA à leurs chunks sources.
7. **`search_query` :** Historique des recherches sémantiques.
8. **`feedback` :** Avis utilisateurs (positifs/négatifs) sur les réponses de l'IA.

---

## 4. Règles de Décision d'Architecture (ADR)

### ADR-01 : Monolithe Next.js + BaaS Supabase
* **Décision :** Utiliser un dépôt unique Next.js pour le front et les API routes, en s'appuyant sur Supabase pour la gestion de l'infrastructure (Auth, DB, Storage).
* **Justification :** Réduit la complexité, élimine l'orchestration de microservices, et accélère radicalement le temps de développement pour le MVP.

### ADR-02 : pgvector avec Index HNSW
* **Décision :** Utiliser l'extension PostgreSQL `pgvector` intégrée à Supabase avec un index HNSW (distance cosinus) pour la recherche sémantique.
* **Justification :** Les données textuelles et les embeddings vivent dans la même base de données. Pas besoin de synchroniser une base de données vectorielle tierce (comme Pinecone/Weaviate), réduisant les latences et les coûts.

### ADR-03 : Embeddings via Supabase Edge Functions
* **Décision :** Générer les embeddings avec le modèle `gte-small` (384 dimensions) exécuté localement en CPU dans les Edge Functions de Supabase (moteur ONNX).
* **Justification :** Garantit la gratuité complète de la génération vectorielle, sans dépendance à une API tierce payante (comme OpenAI Ada), tout en restant conforme au RGPD.

### ADR-04 : API OpenRouter
* **Décision :** Centraliser les requêtes LLM de génération de texte vers l'API OpenRouter en utilisant les modèles du tier gratuit (`:free`).
* **Justification :** Permet de tester plusieurs modèles (Gemini, Llama, Qwen) sans changer de clé API, avec un coût de fonctionnement de 0 € pour le MVP et la démo de soutenance.

### ADR-05 : Isolation RLS Utilisateur dès J0
* **Décision :** Activer la Row Level Security (RLS) sur toutes les tables de la base de données.
* **Justification :** Isolation logique indispensable au niveau PostgreSQL. Un utilisateur ne doit jamais avoir accès aux conversations, requêtes ou données privées d'un autre utilisateur.
