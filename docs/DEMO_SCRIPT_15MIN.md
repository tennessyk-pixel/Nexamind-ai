# Scénario de Présentation & Démo Live — NexaMind AI (15 Minutes Chrono)

**Cible :** Soutenance Finale / Présentation Client & Jury  
**Format :** 15 minutes guidées à la minute près  
**Auteur :** Capri Katanga, Product Builder IA (avec l'appui de l'équipe d'agents BMAD)  

---

## Vue d'Ensemble du Timing (15 minutes)

| Chrono | Durée | Section | Support / Écran à afficher |
| :---: | :---: | :--- | :--- |
| **00:00 - 02:00** | 2 min | **1. Introduction & Vision Métier** | Slides 1 à 3 (Problème & Solution) |
| **02:00 - 05:00** | 3 min | **2. Le Cœur Backend : Supabase & PGVector** | **Navigateur :** Console Supabase (Table Editor + RLS) |
| **05:00 - 09:00** | 4 min | **3. Démonstration Live du MVP** | **Navigateur :** App NexaMind AI (`/dashboard`, `/resources`, `/chat`, `/legal`) |
| **09:00 - 12:00** | 3 min | **4. Architecture & Méthodologie (BMAD)** | **IDE (VS Code) :** Code source (`api/ingest`, `CookieBanner`) |
| **12:00 - 15:00** | 3 min | **5. Bilan, Déploiement & Roadmap V2/V3** | Slides 8 à 10 + Conclusion |

---

## Déroulé Détaillé à la Minute Près

### 1. Introduction & Vision Métier (00:00 - 02:00)
* **Écran à afficher :** Diaporama Slide 1 (Titre), puis Slide 2 (Le Problème) et Slide 3 (La Solution).
* **Ce que tu dis :**
  > *"Bonjour à tous. Aujourd'hui, je vous présente **NexaMind AI**, un assistant copilote d'entreprise propulsé par l'IA et la recherche sémantique par RAG.*  
  > *Le constat en entreprise est simple : les collaborateurs perdent près de 20 % de leur temps de travail à rechercher de l'information dispersée dans des documents internes (procédures RH, devis, fiches techniques). De plus, les IA génératives grand public posent deux risques majeurs en B2B : **les hallucinations** (inventer de fausses réponses) et **la fuite de données confidentielles**.*  
  > *NexaMind AI résout ces deux problèmes : c'est un assistant privé qui répond **exclusivement** en se fondant sur la base de connaissances de l'entreprise, avec des citations cliquables et vérifiables, dans une infrastructure Zero-Trust où les données sont strictement chiffrées et isolées."*

---

### 2. Le Cœur Backend : Supabase, PGVector & Sécurité RLS (02:00 - 05:00)
* **Écran à afficher :** Basculer sur ton navigateur, sur ton **Dashboard Supabase en ligne** (`supabase.com` > Projet NexaMind > *Table Editor*).
* **Ce que tu montres et expliques étape par étape :**
  1. **Les Tables (02:00 - 03:00) :**
     > *"Avant de voir l'interface utilisateur, je vous montre le cœur de notre architecture backend sur **Supabase (PostgreSQL)**. Nous avons modélisé un schéma relationnel propre composé de 10 tables spécialisées : `profiles`, `resource` pour les documents, `chunk` pour les segments de texte, `conversation`, `message`, `citation` pour la traçabilité, et `feedback` pour le suivi qualité."*
     * *Action : Cliquer sur la table **`resource`**, puis sur la table **`chunk`**.*
  2. **L'Extension PGVector (03:00 - 04:00) :**
     > *"Dans la table **`chunk`**, vous observez ici la colonne **`embedding`**. C'est une représentation vectorielle à 384 dimensions générée localement par notre modèle d'IA GTE-small via PGVector. C'est ce qui nous permet de faire une recherche sémantique ultra-rapide par similarité cosinus au lieu d'une simple recherche par mots-clés."*
  3. **La Sécurité & l'Audit RLS (04:00 - 05:00) :**
     * *Action : Cliquer dans le menu de gauche sur **Authentication** > Onglet **Policies (RLS)** ou montrer l'éditeur SQL avec le script d'audit.*
     > *"En environnement B2B, la sécurité est reine. J'ai mené un audit 360° : **100 % de nos 10 tables ont le Row Level Security (RLS) activé**. Chaque ligne en base est rattachée à l'ID chiffré du profil (`user_id = auth.uid()`). Même si un hacker manipulait l'API, le moteur PostgreSQL au niveau SQL lui interdirait l'accès aux documents des autres organisations. De plus, nos fonctions RPC vectorielles sont verrouillées en `SECURITY INVOKER`."*

---

### 3. Démonstration Live du MVP en Action (05:00 - 09:00)
* **Écran à afficher :** Basculer sur l'application web NexaMind AI (en local sur `http://localhost:3000` ou sur Vercel).
* **Étape 1 : Page d'accueil & Ingestion de Documents (05:00 - 06:30) :**
  * *Action : Montrer la page d'accueil `/dashboard`, puis cliquer dans le menu de gauche sur **Ressources** (`/dashboard/resources`). Cliquer sur un document existant ou faire un import rapide.*
  * **Ce que tu dis :**
    > *"Passons sur l'application NexaMind AI, conçue avec une interface moderne en verre dépoli (Glassmorphism) et un mode sombre natif. Sur l'espace Ressources, l'utilisateur gère sa bibliothèque. Fait marquant du MVP : l'IA ne sert pas qu'à tchatter ! En un clic sur un document, notre pipeline IA génère instantanément **un résumé exécutif** et **extrait les points clés**, tout en suggérant des documents apparentés par proximité vectorielle."*
* **Étape 2 : Le Chat IA RAG & Les Citations Anti-Hallucinations (06:30 - 08:00) :**
  * *Action : Cliquer sur **Chat IA** (`/dashboard/chat`). Cliquer sur le bouton "Nouveau chat". Poser une question test en rapport avec tes documents (ex: "Quel est le résumé de ce document ?" ou "Quelle est la procédure d'onboarding ?").*
  * **Ce que tu dis :**
    > *"Dans le Chat IA, je pose une question en langage naturel. Regardez la fluidité de la réponse en streaming (Vercel AI SDK). Surtout : remarquez sous la bulle **les encadrés de Citations documentaires cliquables**. L'IA justifie sa réponse avec son score de pertinence et la source de notre base. Si une information n'est pas dans nos documents, elle l'indique sans inventer."*
* **Étape 3 : Boucle RLHF & Conformité RGPD (08:00 - 09:00) :**
  * *Action : Sous le message de l'IA, cliquer sur le bouton **👍 Utile**. Retourner ensuite sur la page d'accueil (`/dashboard`) pour pointer la carte "Qualité & Feedbacks (RLHF)". Ensuite, pointer le pied du menu avec le badge "RGPD 🔒" et cliquer sur "CGU / RGPD".*
  * **Ce que tu dis :**
    > *"L'utilisateur peut évaluer chaque réponse via les boutons 👍 et 👎. Ce vote alimente directement notre widget d'analyse en temps réel sur le Dashboard : nous mesurons le taux d'utilité pour le Réapprentissage par Renforcement (RLHF).*  
    > *Enfin, regardez ici en bas du menu : **la conformité RGPD intégrée**. Notre bandeau cookies rejette tout traçage publicitaire, et notre page CGU garantit contractuellement le **Zero Data Retention (ZDR)** : nos fournisseurs LLM n'entraînent aucun futur modèle sur les données sensibles de l'entreprise."*

---

### 4. Architecture & Méthodologie BMAD dans l'IDE (09:00 - 12:00)
* **Écran à afficher :** Basculer sur **VS Code / Antigravity** avec le projet ouvert. Montrer l'arborescence des fichiers à gauche, puis ouvrir le fichier [`src/app/api/ingest/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/ingest/route.js) (autour des lignes 10-40) ou [`src/app/api/chat/feedback/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/chat/feedback/route.js).
* **Ce que tu dis :**
  > *"Sous le capot, comment avons-nous construit ce fullstack robuste en un temps record ? Grâce au framework **Next.js App Router** et au strict respect de la méthodologie **BMAD (Build, Measure, Analyze, Document)**.*  
  > *Voici dans mon IDE un de nos endpoints serveurs les plus critiques : [`src/app/api/ingest/route.js`](file:///c:/Users/Win10/.gemini/antigravity/scratch/nexamind-ai/src/app/api/ingest/route.js). Nous utilisons `@xenova/transformers` avec le modèle `gte-small` directement dans notre backend Next.js ! Lorsqu'un fichier est importé, nous le dépons en chunks de 500 caractères, calculons les embeddings en local sur notre serveur, et poussons en base de données. Tout le cycle a été audité et documenté de manière transparente dans notre dossier `docs/`."*

---

### 5. Bilan, Déploiement & Roadmap V2/V3 (12:00 - 15:00)
* **Écran à afficher :** Retour au Diaporama, Slide 8 (Déploiement & Production), Slide 9 (Roadmap V2/V3) et Slide 10 (Conclusion).
* **Ce que tu dis :**
  > *"Pour clore cette présentation, parlons du déploiement et de la vision d'avenir.*  
  > *1. **Déploiement Cloud (Vercel)** : Ce MVP n'est pas qu'un prototype local. L'ensemble est optimisé pour un déploiement CI/CD sur **Vercel**, la plateforme de référence pour Next.js. Grâce aux architectures Edge & Serverless, l'application est prête à absorber la charge d'entreprises à l'échelle.*  
  > *2. **Du MVP aux Versions Supérieures** :*  
  >   *- **Notre MVP actuel (V1)** nous permet de valider le marché : RAG fiable, isolation RLS, UI haut de gamme et conformité légale complète.*  
  >   *- **Pour la V2 (Scale - Fin 2026)** : Nous prévoyons d'intégrer des connecteurs synchrones automatiques (Google Drive, OneDrive, SharePoint) et une gestion d'équipes en RBAC (Rôles Administrateur, Rédacteur, Lecteur).*  
  >   *- **Pour la V3 (Agentic Workflows - 2027)** : Nous évoluerons vers des agents IA proactifs capables de réaliser de la veille réglementaire autonome sur les nouveaux documents importés.*  
  > *Merci pour votre attention, je serai ravi de répondre à vos questions ou d'approfondir un point technique du code !"*

---

## 🛠️ Checklist Avant de Démarrer la Démo
1. [ ] S'assurer que le serveur tourne (`npm run dev` en local ou onglet Vercel prêt).
2. [ ] S'assurer d'avoir au moins **1 conversation sympa dans le chat** avec un vote 👍 et une citation affichée.
3. [ ] S'assurer d'avoir au moins **2 ou 3 documents dans la bibliothèque Ressources** pour montrer les statistiques sur le Dashboard.
4. [ ] Avoir 3 onglets ouverts en amont pour éviter les temps de chargement en live :
   * Onglet 1 : Le Diaporama / Slides.
   * Onglet 2 : Supabase Table Editor en ligne.
   * Onglet 3 : L'application NexaMind AI sur la page d'accueil `/dashboard`.
   * Fenêtre VS Code / Antigravity ouverte en second plan sur `src/app/api/ingest/route.js`.
