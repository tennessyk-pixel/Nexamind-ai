# Backlog de Réalisation — NexaMind AI

## Séquence 2 : Stack & Environnement
- [x] Créer le projet Supabase (`s14`)
- [x] Activer l'extension `pgvector` (`s15`)
- [x] Lancer la phase Planning de BMAD (PRD + architecture) (`s21`)
- [x] Copier le framework BMAD dans le dossier (`s18`)
- [ ] Créer le repo GitHub & le connecter à l'IDE (`s19`)
- [x] Configurer les clés API dans le fichier `.env` (`s1a`)
  - [x] Clé OpenRouter (`OPENROUTER_API_KEY`)
  - [x] URL et Anon Key de Supabase (`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Séquence 3 : Socle Fullstack de l'Application
- [x] Initialiser le projet Next.js (`s22`)
- [x] Configurer Supabase Auth (Inscription / Connexion) (`s23`)
- [x] Créer le modèle de données en base (`s24` / `seed` validé)
- [x] Configurer la sécurité RLS en base (`s25` / `rls` validé)
- [x] Construire les pages et layouts de l'interface (`s26`)
  - [x] Sidebar de navigation générale (Desktop / Mobile)
  - [x] Dashboard principal (avec son bloc hero à 3 états)
  - [x] Bibliothèque / Gestion des ressources (liste + upload)
  - [x] Interface de Chat IA
  - [x] Page de Recherche sémantique
  - [x] Historique et Paramètres
- [x] Connecter le Front à Supabase pour la lecture/écriture (`s27`)
- [x] Valider le socle V1 navigable (Jalon MVP hors IA) (`s28`)

## Séquence 4 : Connexion Intelligence Artificielle (OpenRouter)
- [x] Configurer la route API de chat avec Vercel AI SDK (`s31`)
- [x] Connecter et tester le streaming avec le modèle gratuit de Llama/Gemini (`s32`)

## Séquence 5 : Logique RAG & Base Vectorielle
- [x] Installer pdf-parse et @xenova/transformers (`s41`)
- [x] Créer l'API d'ingestion et de vectorisation gte-small (`s42`)
- [x] Connecter l'upload de documents à la vectorisation RAG (`s43`)
- [x] Implémenter la recherche sémantique avec la fonction match_chunks (`s44`)
- [x] Intégrer les citations cliquables et historiser la conversation (`s45`)

