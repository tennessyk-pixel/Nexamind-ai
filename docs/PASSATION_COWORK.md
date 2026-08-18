# Dossier de passation — livrables documentaires

> À l'intention de l'agent chargé de la rédaction (Cowork).
> Rédigé le 2026-08-15. Neuf livrables, indépendants les uns des autres.

## Comment travailler

**Le dépôt suffit.** Tout est sur GitHub : `https://github.com/tennessyk-pixel/Nexamind-ai`. Aucun accès à la base de données n'est nécessaire — et c'est voulu. Si le fichier `.env` se trouve dans le dossier, ne pas l'ouvrir : il contient une clé qui contourne toutes les protections.

**Écrire uniquement dans `docs/`.** Ne modifier ni `src/`, ni `supabase/`, ni les fichiers de configuration à la racine.

**Lire d'abord** : `README.md` (le système réel), `docs/PLAN_SOUTENANCE.md` (l'état d'avancement), `docs/BRIEF_DOCUMENTATION.md` (les informations périmées à ne pas reprendre), `docs/RAPPORT_EVALUATION_RAG.md` (les chiffres mesurés).

**Mettre à jour `docs/PLAN_SOUTENANCE.md`** après chaque livrable terminé, et committer.

**Contexte** : ces documents servent une soutenance de diplôme couvrant trois blocs du référentiel. Le lecteur est un jury professionnel. Viser la précision et la concision — un document court et exact vaut mieux qu'un document long et approximatif. Ne jamais inventer un chiffre : si une donnée manque, écrire explicitement qu'elle reste à déterminer.

---

## Matière technique commune

**Base de données** — 10 tables : `profiles`, `resource`, `chunk`, `category`, `resource_category`, `conversation`, `message`, `citation`, `search_query`, `feedback`. Définies dans `supabase/migrations/001_schema.sql`.

**Sécurité** — Row Level Security active sur toutes les tables, une trentaine de politiques dans `supabase/migrations/002_rls.sql`. Principes : chacun ne voit que ses propres données (`_own`), les documents indexés sont partagés en lecture (`resource_select_ready`), certaines opérations sont réservées aux administrateurs (`_admin`).

**Fonctions SQL** — `match_chunks` (recherche vectorielle par similarité cosinus), `get_related_resources`, `get_resource_chunks`. Dans `supabase/migrations/003_rpc.sql`.

**Routes API** — quatre, dans `src/app/api/` :
- `POST /api/ingest` — extraction du texte, découpage, vectorisation, insertion
- `POST /api/search` — recherche vectorielle
- `POST /api/chat` — RAG et génération streamée avec citations
- `POST /api/resources/process` — résumé et points clés d'un document

**Chaîne RAG** — segments de 500 caractères avec 100 de recouvrement · vecteurs de 384 dimensions produits par l'Edge Function Supabase `embed` (modèle `gte-small`) · recherche cosinus · injection du contexte · génération via OpenRouter.

**Hébergement** — application sur Vercel (https://nexamindia.vercel.app), base et stockage sur Supabase.

**Chiffres mesurés** (source : `docs/RAPPORT_EVALUATION_RAG.md`) — recherche vectorielle 58 ms médians · pertinence 95,7 % · hallucinations 0 % · coût 0 €.

---

## Les neuf livrables

### 2.2 — Diagramme des workflows et cas d'usage

Décrire les parcours utilisateur : inscription et connexion, import d'un document jusqu'à son indexation, recherche sémantique, conversation avec citations, consultation d'un résumé.

Pour chacun : acteur, déclencheur, étapes, résultat, cas d'erreur. Les diagrammes peuvent être produits en Mermaid, directement lisible dans Markdown.

Fichier attendu : `docs/WORKFLOWS_ET_CAS_USAGE.md`

### 2.3 — Guide UX design

Documenter les principes d'interface : structure de navigation, hiérarchie visuelle, états d'attente et d'erreur, accessibilité, comportement responsive. S'appuyer sur l'interface existante dans `src/app/dashboard/` — décrire ce qui existe, pas un idéal théorique.

Fichier attendu : `docs/GUIDE_UX_DESIGN.md`

### 2.4 — Spécification API et intégration Supabase

Pour chacune des quatre routes : méthode, chemin, corps de requête, réponse, codes d'erreur, authentification requise, durée maximale d'exécution. Documenter aussi l'intégration Supabase : les trois clients (navigateur, serveur, administration), et pourquoi la clé de service ne quitte jamais le serveur.

Fichier attendu : `docs/SPECIFICATION_API.md`

### 4.1 — Dossier de déploiement et runbook

Étapes de mise en production : dépôt, build, variables d'environnement, déploiement Vercel, migrations Supabase, déploiement de l'Edge Function. Puis le runbook d'exploitation : comment revenir en arrière, comment changer de modèle, que faire si le chat tombe.

⚠️ `Runbook_full_NexaMind_AI.html` à la racine décrit **l'ancien hébergement** — s'en inspirer pour la structure, pas pour le contenu.

Fichier attendu : `docs/DEPLOIEMENT_ET_RUNBOOK.md`

### 4.2 — Matrice IAM

Tableau des rôles et de leurs droits : visiteur non connecté, utilisateur authentifié, administrateur, clé de service. Croiser avec les opérations : lire ses documents, lire les documents partagés, importer, supprimer, gérer les catégories.

Documenter aussi la gestion des secrets : quelles clés existent, où elles vivent (variables d'environnement Vercel, fichier `.env` local jamais versionné), qui y a accès, comment les faire tourner.

Fichier attendu : `docs/MATRICE_IAM.md`

### 4.6 — PRA / PCA synthétique

Plan de reprise et de continuité, en version courte et proportionnée. Scénarios : déploiement défectueux, corruption de la base, indisponibilité du fournisseur de modèle, panne Supabase. Pour chacun : détection, action, délai estimé.

**RPO** 24 heures (sauvegarde quotidienne Supabase) · **RTO** 4 heures.

**Matière réelle à exploiter** : le 12 août 2026, l'application est restée inutilisable une journée entière — jeton d'authentification saturé par une image stockée dans les métadonnées de session, endpoint de vectorisation fermé par son fournisseur, modèle de génération retiré du catalogue. Les détails figurent dans `AGENTS.md`. Un incident réellement vécu et analysé vaut mieux qu'un scénario inventé.

Fichier attendu : `docs/PRA_PCA.md`

### 4.8 — Kit support N1/N2

FAQ des incidents courants et procédures de traitement. Niveau 1 : réponse sous 1 jour ouvré. Niveau 2 : correction sous 5 jours ouvrés. Définir ce qui relève de chaque niveau et les modalités d'escalade.

Fichier attendu : `docs/KIT_SUPPORT.md`

### 4.9 — Registre RGPD et sécurité

Données personnelles traitées : compte utilisateur (e-mail), documents importés, historique des conversations et des recherches. Pour chacune : finalité, base légale, durée de conservation, destinataires. Mesures de sécurité : chiffrement en transit et au repos, isolation par RLS, authentification.

Une page de politique de confidentialité existe déjà dans l'application : `src/app/legal/cgu/` — assurer la cohérence entre les deux.

Fichier attendu : `docs/REGISTRE_RGPD.md`

### 7.3 — Registre des données et de l'index RAG

Inventaire du corpus indexé : origine des documents, formats acceptés, volumétrie, paramètres d'indexation (500 caractères, recouvrement 100, 384 dimensions), durée de conservation, procédure de suppression. Politiques de gouvernance : qui décide de ce qui est indexé, comment un document est retiré.

Le corpus de démonstration se trouve dans `demo-docs/` — dix documents d'une entreprise fictive, NexaWorks.

Fichier attendu : `docs/REGISTRE_DONNEES_RAG.md`

---

## Skills BMAD — où ils servent, et où ils ne servent pas

Si l'environnement dispose du framework BMAD, quatre livrables y gagnent. Les autres n'ont pas d'équivalent : ce sont des documents de conformité et d'exploitation, hors de son périmètre. **Ne pas forcer un skill là où il ne correspond pas** — une trame inadaptée produit un document générique là où le référentiel attend du spécifique.

| Livrable | Skill à invoquer | Apport |
|---|---|---|
| 2.3 Guide UX design | `bmad-ux` | Correspondance directe : structure et vocabulaire d'une spécification UX |
| 2.4 Spécification API | `bmad-architecture` ou `bmad-spec` | Cadre de description des composants et de leurs contrats |
| 2.2 Workflows et cas d'usage | `bmad-document-project` | Méthode de documentation d'un projet existant |
| **Les neuf, en relecture finale** | `bmad-editorial-review-prose` puis `bmad-editorial-review-structure` | Passe de qualité : clarté de la prose, puis cohérence de structure |

Aucun skill BMAD ne couvre les livrables 4.1, 4.2, 4.6, 4.8, 4.9 et 7.3. Les rédiger directement, en s'appuyant sur la matière factuelle donnée plus haut.

Pour toute la rédaction, la posture `bmad-agent-tech-writer` est pertinente : documentation technique destinée à un lecteur professionnel, précision avant exhaustivité.

## Ordre suggéré

Commencer par **2.4** (spécification API) et **4.2** (matrice IAM) : la matière est entièrement disponible dans le code, ce sont les plus rapides et les plus factuels. Poursuivre par **7.3** et **4.9**, puis **4.1**, **4.6**, **4.8**. Terminer par **2.2** et **2.3**, qui demandent le plus d'interprétation.

## Ce qui n'est pas délégué

Le MFA (code), le PV de test de restauration (manipulation réelle), l'audit des garde-fous (lecture de code) et le guide de présentation final restent traités par Claude Code.
