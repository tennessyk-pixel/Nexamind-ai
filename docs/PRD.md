# Product Requirements Document (PRD) — NexaMind AI

## 1. Vision & Objectifs du Produit

### 1.1 Contexte & Problématique (NexaWorks)
NexaWorks accompagne des indépendants, petites entreprises et équipes projet dans la gestion de leurs activités. En grandissant, l'entreprise a accumulé une masse de connaissances hétérogènes (documents internes, comptes rendus, FAQ, procédures) sans système centralisé capable de les restituer au bon moment.
* **Conséquences :** 20 % de la semaine de travail perdue à chercher des informations, friction cognitive, perte de savoir-faire, et intégration lente des nouveaux collaborateurs.

### 1.2 Vision Produit
NexaMind AI est le copilote métier interne de NexaWorks. Il transforme la connaissance dispersée en réponses immédiates, fiables et sourcées, pour que chaque collaborateur arrête de chercher et se contente de demander.
* **Promesse centrale :** *« Arrêtez de chercher, demandez. »*

---

## 2. Personas & Profils Utilisateurs

### 2.1 Personas Primaires
* **Nadia (La nouvelle arrivante - Persona Pivot) :** 26 ans, chef de projet junior. Objectif : Devenir autonome rapidement et trouver des procédures fiables d'onboarding ou de facturation sans déranger ses collègues.
* **Marc (Le collaborateur confirmé) :** 38 ans, consultant senior. Objectif : Gagner du temps sur des recherches de clauses ou chiffres précis dans l'historique des projets pour rester crédible devant ses clients.

### 2.2 Personas Secondaires / Décideurs
* **Sonia (La référente connaissance) :** Gardienne du périmètre documentaire. Elle valide et dépose le corpus de départ, et s'assure de la fraîcheur des données.
* **Karim (Le dirigeant / Décideur) :** Non-utilisateur quotidien, il exige le contrôle des coûts (pas de licence par siège), la conformité RGPD, et la protection absolue des données sensibles.

---

## 3. Périmètre fonctionnel du MVP (Must Have)

Le MVP est limité au **savoir opérationnel non sensible uniquement** (procédures, FAQ onboarding, fiches projets). Les données confidentielles (finance, RH) sont exclues de la V1.

### 3.1 Liste des Fonctionnalités V1
1. **Authentification & Session :** Connexion sécurisée (email/mot de passe) via Supabase Auth.
2. **Sécurité d'isolation (RLS) :** Isolation stricte des conversations et requêtes par utilisateur (Must dès J0).
3. **Chat conversationnel :** Interface de chat fluide pour poser des questions en langage naturel.
4. **Réponses RAG sourcées :** Réponses de l'IA basées exclusivement sur le corpus documentaire, avec citations cliquables pointant vers la source d'origine.
5. **Gestion de bibliothèque :** Consultation et ajout manuel de ressources (upload de fichiers par Sonia ou les collaborateurs).
6. **Recherche sémantique :** Recherche dans la bibliothèque basée sur le sens (similarité vectorielle) et pas uniquement sur les mots-clés.
7. **Résumé automatique de document :** Génération d'un résumé structuré d'une ressource en un clic.
8. **Extraction des points clés :** Extraction des décisions, actions et échéances depuis un compte rendu.
9. **Historique des échanges :** Consultation et réouverture des anciennes conversations avec conservation du contexte.
10. **Conformité RGPD :** Mentions légales, CGU, et politique de confidentialité.

### 3.2 Hors scope V1 (Reporté en V2)
* Cloisonnement d'accès fin par périmètre sensible (RLS avancé).
* Import de fichiers en masse (bulk upload admin).
* Aide à la rédaction et reformulation de contenu.
* Intégrations externes (Slack, Google Drive connectés en temps réel).
* Recherche vocale et notifications proactives.

---

## 4. Critères de Succès & indicateurs (KPIs)
* Réduction de 40 % du temps de recherche d'information.
* Taux de réponses utiles évalué par les utilisateurs supérieurs à 80 %.
* Taux de clic sur les citations sources supérieur à 30 %.
* Adhésion des nouveaux collaborateurs lors de leur phase d'onboarding.
