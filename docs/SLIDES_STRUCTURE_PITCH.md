# Structure du Support de Présentation / Diaporama (Pitch Deck 10 Slides) — Séquence s68

Ce document fournit le plan détaillé et le texte pour la création de tes 10 diapos de présentation finale.

---

## Slide 1 : Titre & Accroche
* **Titre :** NexaMind AI — Votre Copilote Documentaire d'Entreprise
* **Sous-titre :** Intelligence Artificielle par RAG (Retrieval-Augmented Generation) avec Zéro Hallucination & Sécurité Zéro-Trust.
* **Éléments visuels suggérés :** Logo NexaWorks, capture d'écran en perspective du Dashboard en mode sombre avec effet verre dépoli.
* **Notes de l'orateur :** "Bonjour. Je vous présente NexaMind AI, une solution SaaS B2B alliant la puissance de l'IA générative et la sécurité des données d'entreprise."

---

## Slide 2 : Le Problème Métier en B2B
* **Titre :** Les Défis de l'Information & de l'IA en Entreprise
* **Points Clés :**
  * 🕒 **20 % du temps perdu :** Les cadres consacrent plus d'une journée par semaine à chercher de l'information dans les fichiers locaux, intranets et PDF dispersés.
  * 🎲 **Risque d'Hallucination :** Les ChatGPT ou LLM publics inventent des faits lorsqu'ils n'ont pas la réponse (inacceptable pour un contrat ou une procédure légale).
  * 🚨 **Insécurité & RGPD :** Risques d'exposition de secrets industriels ou d'utilisation des données privées pour réentraîner des modèles publics.
* **Éléments visuels suggérés :** Icône d'horloge brisée, bouclier d'alerte, statistique en grand ("1 jour / semaine").

---

## Slide 3 : La Solution NexaMind AI
* **Titre :** Une IA Privilégiée, Fiable & Connectée à votre Base
* **Points Clés :**
  * 🧠 **Recherche Vectorielle RAG :** Interroge l'IA en langage naturel directement sur *vos* documents.
  * 🔍 **Preuve & Traçabilité :** Chaque réponse est justifiée par des **Citations Documentaires Cliquables** avec un score d'affinité sémantique.
  * 🛡️ **Isolation & Confidentialité :** Chiffrement complet, Row Level Security (RLS) et contrat Zero Data Retention (ZDR).
* **Éléments visuels suggérés :** Schéma simplifiant Document ➔ Vecteurs PGVector ➔ Chat AI avec Citations.

---

## Slide 4 : Architecture Technique (Le Moteur Backend)
* **Titre :** Une Stack Moderne, Scalable & Performante
* **Points Clés :**
  * **Frontend & API Serverless :** Next.js 15 (App Router) + Vercel Edge.
  * **Base de données & Vecteurs :** Supabase PostgreSQL + Extension **`pgvector`** (Embeddings à 384 dimensions).
  * **IA & Traitement Naturel :** Vercel AI SDK (Streaming), modèles LLM (DeepMind / OpenRouter) + Modèle d'embedding local `@xenova/transformers` (`gte-small`).
* **Éléments visuels suggérés :** Logos de Next.js, Supabase, Vercel, Hugging Face, OpenRouter / Gemini.

---

## Slide 5 : Focus Sécurité & Zéro-Trust (Audit RLS s63)
* **Titre :** Audit Sécurité 360° & Protection par RLS
* **Points Clés :**
  * 🔒 **100 % des tables sous RLS :** 10 tables protégées par des politiques de Row Level Security assorties du contrôle de jetons de session `auth.uid()`.
  * 🛑 **Zéro Fuite Sémantique :** Fonctions SQL vectorielles de recherche verrouillées en mode `SECURITY INVOKER`.
  * 👮‍♂️ **Contrôle d'Élévation :** API protégées interdisant aux utilisateurs non propriétaires d'altérer les données des autres collaborateurs.
* **Éléments visuels suggérés :** Tableau récapitulatif avec des icônes de cadenas verts ("RLS ACTIF").

---

## Slide 6 : Conformité B2B & Cadre Légal (s64)
* **Titre :** Prêt pour les Normes Entreprise & RGPD
* **Points Clés :**
  * 🍪 **Respect de la Vie Privée :** Bandeau intelligent en Glassmorphism (Zéro traçage publicitaire, cookies techniques exclusifs).
  * 📜 **Espace Juridique Intégré :** Pages de Mentions Légales et de CGU / Politique de Protection de Données accessibles depuis le Dashboard.
  * 🔐 **Engagement ZDR (Zero Data Retention) :** Aucune donnée de l'entreprise n'est utilisée pour réentraîner des futurs modèles d'IA.
* **Éléments visuels suggérés :** Capture du badge "RGPD 🔒" en bas du menu et du bandeau de consentement.

---

## Slide 7 : Démonstration Live (Transition)
* **Titre :** Démonstration Live de NexaMind AI
* **Points de démo annoncés à l'écran :**
  1. Console Backend Supabase & Base PGVector.
  2. Gestion de la bibliothèque & Résumés / Points clés générés par IA.
  3. Conversation Chat RAG avec Citations cliquables & Feedback RLHF 👍/👎.
  4. Couche de code serveur dans l'IDE (Pipeline d'ingestion).
* **Éléments visuels suggérés :** Une grande icône "Play" ou une capture d'ensemble du Dashboard.
* **Notes de l'orateur :** *"Passons maintenant au vif du sujet : la démonstration en conditions réelles."*

---

## Slide 8 : Méthodologie BMAD & Construction dans l'IDE
* **Titre :** Une Réalisation Agile avec la Méthodologie BMAD
* **Points Clés :**
  * **B.M.A.D :** **Build** (Construire), **Measure** (Mesurer avec les feedbacks), **Analyze** (Audit 360°), **Document** (Documentation exhaustive).
  * 📂 **Livraison Organisée :** 7 Séquence successives, du cadrage architectural (PRD/SQL) aux finitions de sécurité et d'expérience utilisateur (Dark mode, micro-animations, KPI Feedbacks).
* **Éléments visuels suggérés :** Cycle de vie BMAD avec des coches de validation vertes pour les 7 Séquences du Runbook.

---

## Slide 9 : Du MVP aux Versions Supérieures (Roadmap)
* **Titre :** Stratégie d'Évolution : Du MVP à la Scale
* **Points Clés :**
  * **🚀 V1 (MVP Actuel - Valider) :** RAG documentaire sur PDF/TXT, Chat intelligent, citations vérifiables, RLS par utilisateur, RGPD & RLHF Dashboard.
  * **⚡ V2 (Q4 2026 - Scaler) :** Connecteurs synchrones automatiques (Notion, Google Drive, SharePoint), gestion d'équipes & rôles RBAC (Admin/Éditeur/Lecteur).
  * **🤖 V3 (2027 - Agentic Workflows) :** Agents autonomes proactifs de veille documentaire et interfaçage en réunion (reconnaissance vocale + synthèse d'action en live).
* **Éléments visuels suggérés :** Flèche temporelle ou 3 colonnes de comparaison V1 (Fait) ➔ V2 ➔ V3.

---

## Slide 10 : Déploiement Cloud (Vercel) & Conclusion
* **Titre :** Prêt au Déploiement & Questions / Réponses
* **Points Clés :**
  * 🌐 **Déploiement Continu (CI/CD) sur Vercel :** Performance Edge Serverless & haute disponibilité d'entreprise.
  * 💡 **Bilan :** NexaMind AI prouve que l'IA en entreprise peut être à la fois puissante, transparente (anti-hallucinations) et impénétrable en matière de cybersécurité.
  * 🎓 **Merci pour votre attention.**
* **Éléments visuels suggérés :** QR Code ou lien Web vers l'application en ligne sur Vercel, coordonnées de Capri Katanga.
