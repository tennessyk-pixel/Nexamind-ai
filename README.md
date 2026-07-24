# NexaMind AI — MVP Copilote Métier Intelligent

Fullstack application for NexaWorks — Gestion des connaissances d'entreprise avec assistant conversationnel RAG (Retrieval-Augmented Generation) et base vectorielle Supabase `pgvector`.

---

## 🎯 Objectif du Projet
Développer un copilote métier intelligent pour **NexaWorks** permettant de :
- Centraliser les documents et connaissances d'entreprise (notes, FAQ, procédures, comptes-rendus).
- Permettre une recherche sémantique et vectorielle rapide.
- Proposer un assistant IA conversationnel contextualisé par le RAG.
- Offrir une expérience utilisateur fluide, moderne et sécurisée.

---

## 🏗️ Architecture Technique (Stack)
- **Front-End :** Next.js / React + Tailwind CSS
- **Back-End & Database :** Supabase (`pgvector` pour la base vectorielle)
- **Moteur RAG & IA :** API Gemini / OpenAI + Search Embeddings
- **Automations (Optionnel) :** n8n Workflows

---

## 📑 Structure des Dossiers de Conception
1. `01_vision_produit.md` — Cadrage & Vision Produit
2. `02_architecture_technique.md` — Spécifications & Architecture
3. `03_conception_backend_rag.md` — Schéma Supabase, RLS & Pipeline RAG
4. `04_conception_frontend.md` — Maquettes UX & Interface Chat
