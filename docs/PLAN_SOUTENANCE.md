# Plan de soutenance — suivi des livrables

> **Fichier de suivi partagé.** À lire au début de chaque session, à mettre à jour dès qu'un livrable avance.
> Format de la soutenance : 20 à 25 minutes de présentation libre, puis 10 minutes de questions. Trois blocs à couvrir : 2, 4 et 7.
> Dernière mise à jour : 2026-08-15.

## Légende

`À FAIRE` · `EN COURS` · `FAIT` — et qui s'en charge : **Claude** (technique, mesures), **Cowork** (rédaction documentaire), **Tennessy** (décisions et arbitrages).

---

## Bloc 2 — Conception

| # | Livrable | État | Qui | Notes |
|---|---|---|---|---|
| 2.1 | Schéma de données de l'application | FAIT | — | `supabase/migrations/001_schema.sql`, 10 tables. Reste à en produire une version lisible pour le jury. |
| 2.2 | Diagramme des workflows + cas d'usage | À FAIRE | Cowork | Parcours : inscription, import de document, recherche, chat. |
| 2.3 | Guide UX design | À FAIRE | Cowork | Le skill `bmad-ux` peut servir de base. |
| 2.4 | Spécification API + intégration Supabase | À FAIRE | Cowork | 4 routes : `/api/ingest`, `/api/search`, `/api/chat`, `/api/resources/process`. |
| 2.5 | Budget de performance | **FAIT** | Claude | Section 4 du rapport d'évaluation : 5 seuils définis, tous tenus. |

## Bloc 4 — Déploiement, sécurité opérationnelle, continuité

| # | Livrable | État | Qui | Notes |
|---|---|---|---|---|
| 4.1 | Dossier de déploiement + runbook d'exécution | À FAIRE | Cowork | `Runbook_full_NexaMind_AI.html` existe mais décrit l'ancien hébergement. |
| 4.2 | Matrice IAM — rôles, droits, secrets | À FAIRE | Cowork | Matière réelle : rôles Supabase, politiques RLS, localisation des clés. |
| 4.3 | SSO / MFA | À FAIRE | Tennessy | Absence documentée et justifiée (proposition validée plus bas). |
| 4.4 | Politique de sauvegarde (RPO / RTO) | À FAIRE | Claude + Tennessy | Supabase sauvegarde quotidiennement → RPO 24 h. RTO proposé : 4 heures. |
| 4.5 | PV de test de restauration | À FAIRE | Claude | **Réalisable pour de vrai** : restaurer une sauvegarde et consigner le résultat daté. |
| 4.6 | PRA / PCA synthétique | À FAIRE | Cowork | Version courte, proportionnée au projet. |
| 4.7 | Tableau de bord : logs, métriques, alerting | À FAIRE | Claude | Vercel et Supabase exposent déjà des métriques. |
| 4.8 | Kit support N1/N2 — FAQ, SLA | À FAIRE | Cowork | SLA proposés : N1 sous 1 jour ouvré, N2 sous 5 jours. |
| 4.9 | Registre RGPD / sécurité synthétique | À FAIRE | Cowork | Une page CGU existe déjà dans l'application. |

## Bloc 7 — Évaluation du RAG et garde-fous

| # | Livrable | État | Qui | Notes |
|---|---|---|---|---|
| 7.1 | Démonstration de l'application | FAIT | — | https://nexamindia.vercel.app — compte `recruteur@nexamind.demo`. |
| 7.2 | Rapport d'évaluation : pertinence, hallucinations, latence, coût | **FAIT** | Claude | `docs/RAPPORT_EVALUATION_RAG.md`. 26 cas mesurés, deux modèles comparés. |
| 7.3 | Registre données & index RAG + gouvernance | À FAIRE | Cowork | Origine des documents, découpage, dimensions, durée de conservation. |
| 7.4 | Garde-fous : modération, PII, journalisation | À FAIRE | Claude puis Cowork | Auditer l'existant avant de rédiger. |

---

## Livrable final

**Guide de présentation linéaire** — À FAIRE — **Claude**

Document de conduite, minute par minute : quelle page ouvrir, quoi montrer à l'écran, quoi démontrer en direct, quoi dire. Conçu pour être suivi pendant les 20-25 minutes, sans avoir à réfléchir à l'ordre. À produire **en dernier**, une fois les livrables connus.

---

## Propositions à valider par Tennessy

Aucune de ces questions ne demande de connaissance technique : ce sont des
valeurs proposées, argumentées, qu'il suffit de valider ou de corriger.

| Sujet | Proposition | Pourquoi |
|---|---|---|
| Budget de performance | Mesuré **côté Supabase** : temps de réponse de la recherche vectorielle, de l'Edge Function d'embedding et des requêtes RPC | C'est ce que demande le référentiel. Décidé, plus en attente. |
| **RTO** — délai de remise en service | **4 heures** | Réaliste pour un projet géré par une personne : détecter, diagnostiquer, restaurer. Annoncer moins serait invérifiable. |
| **SSO / MFA** | **Documenter l'absence en la justifiant** | L'application utilise l'authentification Supabase par e-mail et mot de passe. Ajouter un SSO à ce stade introduirait un risque de régression avant la soutenance, pour un bénéfice nul sur un produit sans organisation cliente. Un jury valorise une absence assumée et argumentée plus qu'une implémentation fragile. |
| **SLA N1 / N2** | N1 : réponse sous 1 jour ouvré · N2 : correction sous 5 jours ouvrés | Cohérent avec un projet porté par une seule personne. |

## Journal

- **2026-08-15** — Rapport d'évaluation RAG produit (26 cas mesurés). Fuite de raisonnement détectée sur nemotron (8 %) : production repassée sur gemma-4-26b, déployée et vérifiée.
- **2026-08-15** — Périmètre des trois blocs établi. Plan créé. Corpus de démonstration NexaWorks en place (10 documents). Application en production et vérifiée.
