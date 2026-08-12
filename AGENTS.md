<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Projet de diplôme — privilégier la stabilité

Ce dépôt est un projet de diplôme avec soutenance. En cas d'arbitrage, choisir la solution la plus sûre plutôt que la plus élégante, et ne jamais laisser le dépôt dans un état non fonctionnel.

## Ne pas refaire (pannes déjà survenues)

- **Ne pas supprimer ni désactiver `src/proxy.js`.** C'est la seule protection des routes `/dashboard` : le layout est un composant client, sans garde d'authentification. Le fichier avait été renommé en `.disabled` pour contourner une erreur de build Netlify, laissant le dashboard accessible sans connexion.

- **Ne pas stocker d'image ni de données volumineuses dans `user_metadata` Supabase.** Ces métadonnées sont embarquées dans le JWT de session. Un avatar en base64 avait porté le jeton à 256 000 caractères, dépassant la limite des en-têtes HTTP (`ERR_RESPONSE_HEADERS_TOO_BIG`) : plus aucune requête authentifiée ne passait, en local comme en ligne.

- **Ne pas réintroduire `@xenova/transformers`.** Les embeddings passent par l'Edge Function Supabase `embed` (modèle `gte-small` intégré, 384 dimensions), appelée via `getEmbedding()` dans `src/utils/embeddings.js`. Le modèle local ne peut pas tourner sur un hébergeur distant : binaires natifs et téléchargement du modèle au démarrage à froid.

- **Ne pas coder de modèle IA en repli dans le code.** Le modèle vient de `NEXT_PUBLIC_AI_MODEL`. Les modèles gratuits OpenRouter sont régulièrement retirés ; un repli codé en dur avait figé l'application sur un modèle supprimé et aggravé la panne.

- **Ne pas dupliquer de contrôle d'accès au-dessus des politiques RLS.** Un contrôle « propriétaire ou admin » ajouté dans une route API contredisait la politique `resource_select_ready` et bloquait les résumés sur des documents pourtant lisibles. La RLS fait autorité.

- **Conserver `next build --webpack`.** Turbopack produit une sortie que les adaptateurs d'hébergement ne savent pas traiter.

## Hébergement

Netlify est une impasse pour ce projet : `@netlify/plugin-nextjs` ne sait pas empaqueter le middleware de Next.js 16, et les fonctions serverless coupent vers 10 s alors que la génération de résumé prend ~40 s.

La cible est **Render** (voir `render.yaml`), qui exécute l'application comme un serveur Node classique : middleware natif, aucune limite de durée. Les secrets ne sont jamais commités — ils se saisissent dans le tableau de bord Render.
