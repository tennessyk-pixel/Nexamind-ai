# Experience Spec: NexaMind AI
status: draft
updated: 2026-08-07

## Foundation
Application SaaS Next.js avec Supabase. UI System basé sur Tailwind CSS et Phygital Design "Scène Noire / Digital Mind". Support mode Clair (priorisé pour lecture longue) et mode Sombre.

## Information Architecture
| Surface | Besoin Utilisateur |
|---|---|
| Dashboard Accueil | Vue d'ensemble, stats d'indexation, point d'entrée vers chat/recherche |
| Interface Chat | Poser des questions, recevoir des réponses sourcées, évaluer (RLHF) |
| Gestion Ressources | Uploader, visualiser et supprimer les documents sources |

## Voice & Tone
Professionnel, précis, direct. Pas de phrases génériques ("Elevate", "Next-Gen"). Les erreurs doivent être explicatives et donner la marche à suivre.

## State Patterns
**Bloc Dashboard (Hero & Stats)**
- Empty : Message de bienvenue, CTA principal (Poser question / Uploader).
- Loading : Squelettes (Pulse) sur les métriques.
- Success : Affichage net des chiffres.
- Error : "Impossible de charger les statistiques. [Réessayer]" (Bouton inline).

**Barre de Recherche**
- Empty : Placeholder clair "Ex: Quelle est la procédure de facturation ?" avec icône Loupe grisée.
- Loading : Spinner discret dans l'input (remplace la loupe).
- Success : Dropdown avec suggestions.
- Disabled : Opacité réduite, curseur not-allowed.

## Accessibility Floor
- Contraste : Ratio > 4.5:1 exigé en mode clair et sombre.
- Focus : `ring-2` visible sur chaque champ et bouton interactif.
- Motion : Les transitions UI doivent respecter le flag `prefers-reduced-motion` natif de Tailwind (`transition-all`).
- Sémantique : Utiliser `<nav>`, `<main>`, `<article>`, `<button>` (et non `<div onClick>`).

## Key Flows
**1. Recherche et Conversation (Mary, Consultante B2B)**
- Mary se connecte en plein jour (Mode Clair).
- Elle tape une question métier dans la barre d'accueil.
- L'interface transitionne de manière fluide vers le Chat.
- Elle reçoit sa réponse avec sources (Climax).
- Elle vote pouce levé (Feedback direct).
