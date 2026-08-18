# Index des livrables — soutenance NexaMind AI

> Document de navigation. Chaque livrable avec son nom exact, son bloc, la couche technique concernée, son emplacement et son état.
> Soutenance : 20 à 25 minutes de présentation, 10 minutes de questions. Blocs 2, 4 et 7.
> Mise à jour : 2026-08-15.

## Comment lire les couches

| Couche | Ce qu'elle recouvre |
|---|---|
| **Supabase** | Base de données, RLS, authentification, stockage, Edge Functions |
| **Back-end** | Routes API Next.js, pipeline RAG, appels aux modèles |
| **Front-end** | Interface, parcours utilisateur, expérience |
| **Transverse** | Infrastructure, exploitation, conformité, organisation |

---

## Bloc 2 — Conception

| # | Nom exact du livrable | Couche | Fichier | État |
|---|---|---|---|---|
| 2.1 | Schéma de données de l'application | **Supabase** | `supabase/migrations/001_schema.sql` | ✅ Fait |
| 2.2 | Diagramme des workflows et cas d'usage | **Transverse** | `docs/WORKFLOWS_ET_CAS_USAGE.md` | ⬜ À faire — Cowork |
| 2.3 | Guide UX design | **Front-end** | `docs/GUIDE_UX_DESIGN.md` | ⬜ À faire — Cowork |
| 2.4 | Spécification API et intégration Supabase | **Back-end + Supabase** | `docs/SPECIFICATION_API.md` | ⬜ À faire — Cowork |
| 2.5 | Budget de performance | **Supabase** | `docs/RAPPORT_EVALUATION_RAG.md` § 4 | ✅ Fait |

## Bloc 4 — Déploiement, sécurité opérationnelle, continuité

| # | Nom exact du livrable | Couche | Fichier | État |
|---|---|---|---|---|
| 4.1 | Dossier de déploiement et runbook d'exécution | **Transverse** | `docs/DEPLOIEMENT_ET_RUNBOOK.md` | ⬜ À faire — Cowork |
| 4.2 | Matrice IAM — rôles, droits, gestion des secrets | **Supabase** | `docs/MATRICE_IAM.md` | ⬜ À faire — Cowork |
| 4.3 | Sécurité d'accès opérationnelle — SSO / MFA | **Supabase + Front-end** | à produire | 🔧 En cours — Claude |
| 4.4 | Politique de sauvegardes (RPO / RTO) | **Supabase** | `docs/PRA_PCA.md` | ⬜ À faire — Cowork |
| 4.5 | PV de test de restauration | **Supabase** | à produire | ⬜ À faire — Claude |
| 4.6 | PRA / PCA synthétique | **Transverse** | `docs/PRA_PCA.md` | ⬜ À faire — Cowork |
| 4.7 | Tableau de bord — logs, métriques, alerting | **Transverse** | à produire | ⬜ À faire — Claude |
| 4.8 | Kit support N1 / N2 — FAQ et SLA | **Transverse** | `docs/KIT_SUPPORT.md` | ⬜ À faire — Cowork |
| 4.9 | Registre RGPD et sécurité synthétique | **Transverse** | `docs/REGISTRE_RGPD.md` | ⬜ À faire — Cowork |

## Bloc 7 — Évaluation du RAG et garde-fous

| # | Nom exact du livrable | Couche | Fichier | État |
|---|---|---|---|---|
| 7.1 | Démonstration de l'application | **Front-end** | https://nexamindia.vercel.app | ✅ Fait |
| 7.2 | Rapport d'évaluation — pertinence, hallucinations, latence, coût | **Back-end + Supabase** | `docs/RAPPORT_EVALUATION_RAG.md` | ✅ Fait |
| 7.3 | Registre des données et de l'index RAG, gouvernance | **Supabase** | `docs/REGISTRE_DONNEES_RAG.md` | ⬜ À faire — Cowork |
| 7.4 | Dossier garde-fous et conformité — modération, PII, journalisation | **Back-end** | à produire | ⬜ À faire — Claude |

## Livrable transversal

| Nom exact | Couche | Fichier | État |
|---|---|---|---|
| Guide de présentation linéaire | **Transverse** | à produire | ⬜ À faire en dernier — Claude |

---

## Avancement

**4 livrables terminés sur 19.** Les neuf confiés à Cowork sont indépendants les uns des autres et peuvent avancer en parallèle — voir `docs/PASSATION_COWORK.md`.

## Documents de travail

Ces fichiers ne sont pas des livrables de soutenance, mais servent à les produire.

| Fichier | Rôle |
|---|---|
| `docs/PLAN_SOUTENANCE.md` | Suivi détaillé, journal des sessions, décisions en attente |
| `docs/PASSATION_COWORK.md` | Consignes de rédaction pour les neuf livrables délégués |
| `docs/BRIEF_DOCUMENTATION.md` | Informations périmées à ne pas reprendre |
| `evaluation/` | Jeu de tests, banc de mesure et résultats bruts du rapport 7.2 |
| `AGENTS.md` | Pièges déjà rencontrés — à lire avant toute modification de code |
| `README.md` | Description du système réellement déployé |

## Éléments d'accès

| | |
|---|---|
| Application en ligne | https://nexamindia.vercel.app |
| Compte de démonstration | `recruteur@nexamind.demo` |
| Dépôt | https://github.com/tennessyk-pixel/Nexamind-ai |
