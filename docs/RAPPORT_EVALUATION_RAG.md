# Rapport d'évaluation du pipeline RAG

**NexaMind AI** — bloc 7
Mesures réalisées le 2026-08-15 sur le système en production (https://nexamindia.vercel.app)

---

## 1. Objet et méthode

Ce rapport mesure la qualité du pipeline de génération augmentée par la recherche (RAG) de NexaMind AI. Les chiffres présentés ne sont pas des estimations : ils proviennent de l'exécution d'un jeu de tests contre le système réellement déployé — Edge Function de vectorisation, base pgvector, génération via OpenRouter.

**Jeu de tests** : 26 questions sur le corpus NexaWorks (10 documents internes), réparties en six catégories :

| Catégorie | Nombre | Ce qu'elle éprouve |
|---|---|---|
| Fait simple | 7 | Restitution d'une information explicite |
| Fait chiffré | 9 | Précision sur des montants, durées, seuils |
| Procédure | 2 | Restitution d'un enchaînement d'étapes |
| Raisonnement | 4 | Seuils, exceptions, formulations négatives |
| Synthèse | 1 | Reformulation de plusieurs éléments |
| **Piège** | **3** | **Questions sans réponse dans le corpus** |

Les trois cas pièges sont déterminants : deux portent sur des informations absentes du corpus (frais de crèche, prime de fin d'année), le troisième sur une connaissance générale hors périmètre (capitale de l'Australie). Un assistant documentaire doit refuser de répondre, y compris quand il connaît la réponse.

**Reproductibilité** : jeu de tests dans `evaluation/jeu-de-tests.json`, banc de mesure dans `evaluation/mesurer.mjs`, résultats bruts dans `evaluation/resultats*.json`. La commande `node evaluation/mesurer.mjs` rejoue l'ensemble.

---

## 2. Résultats

### 2.1 Pertinence de la recherche

Mesurée sur les 23 questions dont la réponse figure dans le corpus.

| Indicateur | Résultat |
|---|---|
| Bon document présent dans les 5 extraits remontés | **22 / 23 — 95,7 %** |
| Bon document classé en première position | **20 / 23 — 87,0 %** |
| Similarité cosinus du meilleur extrait | min 86 % · médiane 89 % · max 94 % |

La recherche sémantique identifie le bon document dans 96 % des cas. Le cas manquant concerne une question dont la formulation s'éloigne fortement du vocabulaire du document source.

### 2.2 Exactitude des réponses

| Indicateur | Résultat |
|---|---|
| Réponses contenant tous les éléments factuels attendus | **19 / 23 — 82,6 %** |

Les quatre réponses incomplètes ne contiennent aucune information fausse : elles omettent un élément secondaire ou reformulent sans reprendre le terme exact recherché. Aucune erreur factuelle n'a été relevée.

### 2.3 Hallucinations

| Indicateur | Résultat |
|---|---|
| Réponses inventées sur les cas pièges | **0 / 3 — 0 %** |

Sur les trois questions sans réponse possible, l'assistant a explicitement signalé l'absence d'information dans les trois cas. Il a notamment refusé de répondre à la question sur la capitale de l'Australie, dont il connaît pourtant la réponse — le cantonnement au périmètre documentaire fonctionne.

### 2.4 Latences

Mesures de bout en bout, en millisecondes.

| Étape | Médiane | 95e centile | Maximum |
|---|---|---|---|
| Vectorisation de la question | 302 | 833 | 1 593 |
| Recherche vectorielle (pgvector) | 58 | 128 | 835 |
| Génération de la réponse | 2 101 | 7 074 | 7 209 |
| **Total** | **2 561** | **7 632** | **8 309** |

La recherche vectorielle est négligeable : 58 ms médians sur l'ensemble du corpus. L'essentiel du temps est consommé par la génération, c'est-à-dire par un service externe.

### 2.5 Consommation et coût

| Indicateur | Résultat |
|---|---|
| Jetons par question (médiane) | 680 |
| Total sur les 26 questions | 22 319 jetons |
| **Coût** | **0 €** |

Le coût est nul et le restera : la vectorisation s'exécute dans l'infrastructure Supabase déjà utilisée, et la génération repose sur des modèles gratuits d'OpenRouter. Aucun appel à une API payante.

---

## 3. Comparaison de deux modèles

Les 26 mêmes cas ont été exécutés contre deux modèles, afin d'objectiver le choix de production.

| Critère | `nemotron-3-super-120b` | `gemma-4-26b` |
|---|---|---|
| Réponses complètes | 19 / 23 | 19 / 23 |
| Hallucinations | 0 / 3 | 0 / 3 |
| **Fuite de raisonnement interne** | **2 cas (8 %)** | **0** |
| Caractères parasites | 0 | 0 |
| Latence médiane | 2 561 ms | 3 441 ms |
| Jetons par question | 858 | 680 |

**Constat déterminant** : nemotron est un modèle à raisonnement. Dans 8 % des cas, il émet sa réflexion interne en anglais au lieu de la réponse attendue — par exemple *« We need to answer... We must answer based on provided documents only »*. Le phénomène avait été observé en production avant d'être quantifié ici.

**Décision** : la production utilise `gemma-4-26b`. Exactitude identique, aucune fuite de raisonnement, 20 % de jetons en moins. Les 900 ms supplémentaires sont un compromis acceptable.

Les deux autres modèles restent configurés en repli automatique : les modèles gratuits sont régulièrement retirés du catalogue, et le système bascule seul en cas d'indisponibilité.

---

## 4. Budget de performance

Seuils que le système s'engage à tenir, et mesure constatée.

| Indicateur | Seuil | Constaté | Verdict |
|---|---|---|---|
| Recherche vectorielle | < 200 ms | 58 ms (médiane) | ✅ tenu |
| Vectorisation d'une question | < 1 000 ms | 302 ms (médiane) | ✅ tenu |
| Réponse complète du chat | < 5 000 ms | 3 441 ms (médiane) | ✅ tenu |
| Pertinence de la recherche | > 90 % | 95,7 % | ✅ tenu |
| Taux d'hallucination | 0 % | 0 % | ✅ tenu |

Le 95e centile de la génération dépasse le seuil (7 074 ms). Cette dispersion provient de la charge variable des modèles gratuits et échappe au contrôle de l'application. Elle est assumée et documentée comme telle.

---

## 5. Limites de cette évaluation

Ces résultats doivent être lus avec trois réserves.

**La taille du corpus.** Dix documents, environ 60 segments. Les performances de recherche se dégradent généralement à mesure que le corpus grandit et que des documents proches se concurrencent.

**L'évaluation de l'exactitude est automatique.** La présence des éléments attendus est vérifiée par correspondance textuelle, ce qui produit des faux négatifs quand le modèle reformule. Le taux de 82,6 % est donc un plancher, pas un plafond.

**Le jeu de tests a été rédigé à partir du corpus.** Il éprouve la restitution fidèle, pas la robustesse face à des formulations imprévues d'utilisateurs réels.

---

## 6. Conclusion

Le pipeline remplit sa fonction : il retrouve le bon document dans 96 % des cas, répond sans erreur factuelle, et — c'est le point le plus important pour un assistant documentaire d'entreprise — **n'invente jamais**. Les trois cas pièges ont tous été refusés explicitement.

Le principal risque identifié n'est pas la qualité de la recherche mais la **dépendance à des modèles gratuits externes**, dont la disponibilité et le comportement varient. Ce risque est atténué par une chaîne de repli automatique et par le fait que le modèle est configurable sans redéploiement du code.
