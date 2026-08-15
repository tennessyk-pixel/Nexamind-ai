# NexaMind AI

Assistant documentaire d'entreprise : importez vos documents, interrogez-les en langage naturel, obtenez des réponses sourcées.

**Démo en ligne → https://nexamindia.vercel.app**

```
Identifiant : recruteur@nexamind.demo
Mot de passe : DemoNexaMind2026
```

La création de compte est également ouverte, sans confirmation par e-mail.

---

## Le problème traité

Dans une entreprise, l'information existe mais reste introuvable : elle est dispersée entre des procédures, des comptes rendus, des FAQ et des notes. Un nouvel arrivant qui cherche le plafond de remboursement d'un repas en déplacement ouvre cinq documents avant de trouver, ou renonce et pose la question à un collègue.

NexaMind répond à la question directement, en citant le passage exact du document interne qui fait foi. La réponse est vérifiable : chaque affirmation renvoie à sa source.

Le corpus de démonstration simule l'intranet d'une société fictive, **NexaWorks** — télétravail, notes de frais, congés, sécurité informatique, processus commercial. Essayez par exemple :

- « Combien de jours de télétravail par semaine ? »
- « Qui valide un devis de 30 000 euros ? »
- « Quel est le plafond pour un repas en déplacement ? »

---

## Fonctionnalités

**Import et indexation.** Dépôt de fichiers PDF, DOCX, Markdown ou texte. Le texte est extrait, découpé, vectorisé et rendu interrogeable automatiquement.

**Recherche sémantique.** La recherche porte sur le sens, pas sur les mots-clés : « congé pour mariage » retrouve le passage pertinent même si le document dit « absences exceptionnelles ».

**Chat avec citations.** L'assistant répond en s'appuyant uniquement sur les documents indexés et cite ses sources sous forme de références cliquables. S'il ne trouve pas l'information, il le dit plutôt que d'inventer.

**Résumé automatique** et extraction des points clés d'un document.

**Isolation des données.** Chaque utilisateur ne voit que ses propres documents et ceux explicitement partagés, appliqué au niveau de la base de données.

---

## Architecture

```
Navigateur
    │
    ├── Next.js 16 (App Router) ── proxy.js : protection des routes + session
    │
    ├── Routes API (Node)
    │     ├── /api/ingest    extraction → découpage → vectorisation
    │     ├── /api/search    recherche vectorielle
    │     └── /api/chat      RAG + génération streamée
    │
    ├── Supabase
    │     ├── Auth (JWT, sessions)
    │     ├── PostgreSQL + pgvector (10 tables, RLS active)
    │     ├── Storage (fichiers sources)
    │     └── Edge Function `embed` (gte-small, 384 dimensions)
    │
    └── OpenRouter — génération de texte, chaîne de modèles avec repli
```

### Le pipeline RAG en détail

1. **Extraction** — le texte est extrait du fichier (`unpdf` pour les PDF).
2. **Découpage** — segments de 500 caractères avec 100 caractères de recouvrement, pour qu'une phrase coupée reste compréhensible dans les deux segments.
3. **Vectorisation** — chaque segment est converti en vecteur de 384 dimensions par le modèle `gte-small`, exécuté dans une Edge Function Supabase.
4. **Stockage** — les vecteurs sont indexés dans PostgreSQL via `pgvector`.
5. **Recherche** — la question de l'utilisateur est vectorisée à son tour, puis comparée aux segments par similarité cosinus (fonction SQL `match_chunks`).
6. **Génération** — les segments les plus proches sont injectés comme contexte dans le prompt, et le modèle rédige une réponse en citant ses sources.

### Choix techniques notables

**Vectorisation déportée dans une Edge Function.** Le modèle d'embedding tournait initialement dans l'application via `@xenova/transformers`. Cette approche fonctionne en local mais pas sur un hébergeur serverless : les binaires natifs et le téléchargement du modèle au démarrage à froid dépassent les limites de taille et de délai. Le modèle `gte-small` intégré à Supabase produit des vecteurs compatibles — similarité cosinus de 0,998 avec les vecteurs existants, résultats de recherche identiques — tout en supprimant la dépendance lourde.

**Sécurité déléguée à la base.** Les règles d'accès sont écrites en politiques Row Level Security PostgreSQL plutôt que dupliquées dans le code applicatif. Une seule source de vérité : une requête qui contournerait l'application resterait bloquée.

**Modèle configurable, jamais codé en dur.** Les modèles gratuits sont régulièrement retirés ou saturés. Le modèle vit dans une variable d'environnement, et une chaîne de repli permet à OpenRouter de basculer automatiquement sur un modèle disponible.

---

## Stack

| Domaine | Technologie |
|---|---|
| Framework | Next.js 16.2 (App Router), React 19 |
| Style | Tailwind CSS 4 |
| Base de données | PostgreSQL + pgvector (Supabase) |
| Authentification | Supabase Auth (JWT) |
| Stockage | Supabase Storage |
| Embeddings | gte-small, 384 dimensions (Supabase Edge Function) |
| Génération | OpenRouter (chaîne de modèles avec repli) |
| Hébergement | Vercel |

---

## Installation locale

```bash
git clone https://github.com/tennessyk-pixel/Nexamind-ai.git
cd Nexamind-ai
npm install
```

Créez un fichier `.env` à la racine :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
NEXT_PUBLIC_AI_MODEL=nvidia/nemotron-3-super-120b-a12b:free
```

Appliquez les migrations dans l'ordre depuis `supabase/migrations/`, déployez l'Edge Function `supabase/functions/embed`, puis :

```bash
npm run dev
```

> La clé `SUPABASE_SERVICE_ROLE_KEY` contourne les politiques RLS. Elle n'est utilisée que côté serveur et ne doit jamais être exposée au navigateur.

---

## Structure du dépôt

```
src/
  app/
    api/          routes d'ingestion, recherche, chat, traitement
    dashboard/    bibliothèque, recherche, chat, réglages
    login/        authentification
  utils/
    supabase/     clients navigateur, serveur et administration
    embeddings.js appel à l'Edge Function de vectorisation
    openrouter.js client LLM avec chaîne de repli
  proxy.js        protection des routes et rafraîchissement de session

supabase/
  migrations/     schéma, RLS, fonctions RPC, données initiales
  functions/embed Edge Function de vectorisation

demo-docs/        corpus de démonstration NexaWorks
docs/             documentation technique, audit de sécurité, PRD
```

---

## Documentation

Le dossier `docs/` contient l'architecture détaillée, la documentation technique, l'audit de sécurité RLS, le PRD et le bilan de projet.
