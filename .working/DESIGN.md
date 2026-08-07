# Design System: NexaMind AI
status: draft
updated: 2026-08-07

## 1. Visual Theme & Atmosphere
SaaS B2B "Digital Mind". L'atmosphère est clinique, high-tech et haut de gamme, rappelant le software Apple et les références Sharplink. Les interfaces respirent (Density 7 pour le SaaS, mais aéré). Le thème est dual (Clair et Sombre), le mode Clair étant privilégié pour les recherches documentaires en entreprise afin de maximiser la lisibilité. Flous de verre (glassmorphism) très discrets, bordures ultra-fines (1px), pas de gradients IA génériques.

## 2. Color Palette & Roles
- **Pure White** (`#FFFFFF`) — Fond principal en mode clair, pour un aspect papier clinique.
- **Deep Slate** (`#090E17`) — Fond principal en mode sombre, un bleu/gris abyssal très profond.
- **Cerulean Tech** (`#0EA5E9`) — Accent unique (Bleu clair/cyan). Utilisé pour les boutons primaires et le focus ring. Saturation contrôlée.
- **Silver Border** (`rgba(0,0,0,0.08)`) — Séparateurs en mode clair.

## 3. Typography Rules
- Display : `Geist` — Géométrique, chirurgicale, parfaite pour l'interface data-dense.
- Body    : `Geist` — Lisibilité maximale.
- Mono    : `Geist Mono` — Pour les données, les logs et le code généré par l'IA.
- Banned  : `Arial`, `Inter`, Polices à empattements (Serif), Comic Sans.

## 4. Component Stylings
- Buttons   : Radius fin (rounded-lg), padding généreux, pas d'ombre excessive. Hover avec léger changement d'opacité, retour haptique visuel (`scale-95`).
- Cards     : Bordures 1px, fond très légèrement teinté (ex: `bg-slate-50` en clair, `bg-slate-800/50` en sombre).
- Inputs    : Focus ring net (`ring-2 ring-sky-500/50`), label clair au-dessus.
- Loading   : Skeletal matching layout précis.
- Empty     : État vide invitant avec icône sobre (ex: `Brain` Lucide).
- Error     : Message inline, rouge sourd (`#DC2626`).

## 5. Layout Principles
Grille rigoureuse. Toujours responsive.
- Utilisation stricte de `overflow-hidden` sur le conteneur principal pour éviter tout débordement.
- Padding conséquent (p-6 ou p-8) sur les grands écrans.
- Typographie `break-words` pour les très longs contenus (URLs, logs).

## 6. Motion & Interaction
- Transitions CSS fluides (`duration-200` ou `duration-300`).
- Apparition des éléments en cascade (`fade-in slide-in-from-bottom`).
- Uniquement hardware-accelerated (opacity, transform).

## 7. Anti-Patterns (Banned)
- ❌ Gradients violents (violet/magenta) génériques d'IA.
- ❌ Éléments flottants sans contrainte de grille.
- ❌ Textes illisibles en mode clair (contraste faible).
- ❌ Emojis (remplacés par des icônes Lucide).
