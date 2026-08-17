# Brief — mise à jour de la documentation

> Document de cadrage à l'intention de l'agent chargé de la documentation.
> Rédigé le 2026-08-15, après la mise en production du projet.

## Périmètre

**Travailler uniquement dans `docs/`.** Ne modifier ni `src/`, ni `supabase/`, ni les fichiers de configuration à la racine (`package.json`, `next.config.mjs`, `render.yaml`, `.gitignore`). Aucune modification de code n'est attendue ni souhaitée dans le cadre de ce travail.

Aucun accès à la base de données n'est nécessaire. Si le fichier `.env` est présent, ne pas l'ouvrir : il contient une clé de service qui contourne toutes les politiques de sécurité.

## Pourquoi cette mise à jour

L'architecture a changé lors de la mise en production. Quatre documents décrivent encore l'ancienne version et affirment des choses désormais fausses. Un jury qui lit la documentation puis observe le système en production constaterait la contradiction.

## Ce qui a changé, et ce qu'il faut écrire à la place

### 1. La vectorisation ne se fait plus dans l'application

**Ce que disent les documents :** le modèle `gte-small` est exécuté localement dans le backend Next.js via `@xenova/transformers`, ce qui est présenté comme un choix de confidentialité et de coût.

**La réalité :** cette dépendance a été **retirée du projet**. Les embeddings sont produits par une **Edge Function Supabase nommée `embed`**, qui utilise le modèle `gte-small` intégré à Supabase — toujours 384 dimensions, toujours gratuit, toujours sans appel à une API tierce payante.

**Pourquoi ce changement :** le modèle local ne peut pas fonctionner sur un hébergeur serverless. Il embarque des binaires natifs et télécharge ses poids au premier démarrage, ce qui dépasse les limites de taille et de délai d'exécution. L'application fonctionnait en local mais échouait en ligne.

**Argument à conserver :** la confidentialité et l'absence de coût restent valables. Les données ne sortent pas de l'infrastructure Supabase, où la base de données réside déjà. L'argument n'est pas perdu, il se déplace.

**Vérification faite avant bascule :** les vecteurs produits par les deux méthodes ont une similarité cosinus de 0,998, et les recherches renvoient les mêmes documents dans le même ordre.

### 2. L'hébergement est Vercel, pas Netlify

**La réalité :** le projet est en production sur **https://nexamindia.vercel.app**.

**Pourquoi :** l'adaptateur Netlify pour Next.js ne sait pas empaqueter le middleware de Next.js 16 — celui qui protège les routes `/dashboard`. Le seul déploiement Netlify ayant abouti l'avait fait au prix de la suppression de cette protection. Vercel prend Next.js 16 en charge nativement, sans adaptateur.

### 3. Le modèle de génération n'est plus le même

`google/gemma-2-9b-it:free` a été **retiré du catalogue OpenRouter**. Le modèle courant est `nvidia/nemotron-3-super-120b-a12b:free`, défini par la variable d'environnement `NEXT_PUBLIC_AI_MODEL`.

Ne mentionner aucun modèle comme figé : les modèles gratuits sont régulièrement retirés. Une chaîne de repli bascule automatiquement sur un modèle disponible en cas d'indisponibilité.

## Documents concernés

| Document | À corriger |
|---|---|
| `TECHNICAL_DOCUMENTATION.md` | lignes 55 et 175 — pipeline d'embedding et justification FinOps |
| `BILAN_PERSPECTIVES_V2.md` | lignes 26 et 39 — tableau des choix techniques et schéma |
| `SLIDES_STRUCTURE_PITCH.md` | lignes 40 et 41 — stack annoncée et logos suggérés |
| `DEMO_SCRIPT_15MIN.md` | ligne 68 — passage lu à voix haute pendant la démonstration |

`ARCHITECTURE.md`, `PRD.md` et `SECURITY_AUDIT_REPORT.md` ne contiennent pas de mention périmée sur ces points, mais méritent une relecture de cohérence.

## Éléments factuels utiles

- Découpage : segments de 500 caractères, recouvrement de 100
- Vecteurs : 384 dimensions, recherche par similarité cosinus via la fonction SQL `match_chunks`
- Sécurité : politiques Row Level Security sur les tables ; la clé de service n'est utilisée que côté serveur
- Corpus de démonstration : documents d'une entreprise fictive, NexaWorks, disponibles dans `demo-docs/`
- Compte de démonstration : `recruteur@nexamind.demo`
- Le README à la racine a déjà été mis à jour et décrit le système réel — il peut servir de référence.
