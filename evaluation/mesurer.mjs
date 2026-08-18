/**
 * Banc de mesure du pipeline RAG.
 *
 * Exécute chaque cas du jeu de tests contre le système réel — Edge Function
 * d'embedding, recherche vectorielle pgvector, génération OpenRouter — et
 * consigne pertinence, hallucinations, latences et consommation de jetons.
 *
 * Usage : node evaluation/mesurer.mjs
 * Sortie : evaluation/resultats.json
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const MODELE = process.argv[2] || env.NEXT_PUBLIC_AI_MODEL
const SEUIL = 0.3
const NB_EXTRAITS = 5

async function embed(texte) {
  const debut = performance.now()
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/embed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texte }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return { vecteur: json.embedding, ms: performance.now() - debut }
}

async function rechercher(vecteur) {
  const debut = performance.now()
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: vecteur,
    match_threshold: SEUIL,
    match_count: NB_EXTRAITS,
  })
  if (error) throw new Error(error.message)
  return { extraits: data, ms: performance.now() - debut }
}

async function generer(question, extraits) {
  const contexte = extraits
    .map((e, i) => `[Document ${i + 1}] (${e.resource_title})\n${e.content}`)
    .join('\n\n')

  // Reproduit la consigne appliquée par l'application en production.
  const consigne =
    "Tu es NexaMind AI, assistant documentaire de NexaWorks. Réponds UNIQUEMENT à partir " +
    "des documents fournis, en citant tes sources sous la forme [Document N]. " +
    "Si l'information ne figure pas dans les documents, dis-le clairement sans inventer."

  const debut = performance.now()
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELE,
      messages: [
        { role: 'system', content: consigne },
        { role: 'user', content: `Contexte :\n${contexte}\n\nQuestion : ${question}` },
      ],
      max_tokens: 400,
    }),
  })
  const json = await res.json()
  const ms = performance.now() - debut
  if (json.error) return { texte: null, erreur: json.error.message, ms, jetons: null }
  return {
    texte: json.choices?.[0]?.message?.content?.trim() ?? '',
    modele_utilise: json.model,
    ms,
    jetons: json.usage ?? null,
  }
}

/** Un refus est reconnu à des formulations d'absence, pas à un simple mot-clé. */
function estUnRefus(texte) {
  if (!texte) return false
  const t = texte.toLowerCase()
  return [
    'ne figure pas', "n'est pas mentionn", 'ne contient pas', 'aucune information',
    "je n'ai pas trouv", 'ne permet pas de répondre', 'pas d\'information',
    'ne trouve pas', 'non disponible', 'ne dispose pas',
  ].some((f) => t.includes(f))
}

const jeu = JSON.parse(readFileSync('evaluation/jeu-de-tests.json', 'utf8'))
const resultats = []

console.log(`Modèle : ${MODELE}`)
console.log(`${jeu.cas.length} cas à mesurer\n`)

for (const cas of jeu.cas) {
  process.stdout.write(`${cas.id} … `)
  try {
    const e = await embed(cas.question)
    const r = await rechercher(e.vecteur)
    const g = await generer(cas.question, r.extraits)

    const titres = r.extraits.map((x) => x.resource_title)
    const bonDocTrouve = cas.document_attendu ? titres.includes(cas.document_attendu) : null
    const rangDoc = cas.document_attendu ? titres.indexOf(cas.document_attendu) + 1 || null : null

    const reponse = g.texte ?? ''
    const elementsPresents = cas.elements_attendus.filter((el) =>
      reponse.toLowerCase().includes(el.toLowerCase())
    )

    const refus = estUnRefus(reponse)
    // Hallucination : l'assistant répond alors qu'aucune source ne le permet.
    const hallucination =
      (cas.categorie === 'hors-corpus' || cas.categorie === 'hors-domaine') && !refus && reponse.length > 0

    resultats.push({
      id: cas.id,
      question: cas.question,
      categorie: cas.categorie,
      document_attendu: cas.document_attendu,
      documents_trouves: [...new Set(titres)],
      bon_document_trouve: bonDocTrouve,
      rang_du_bon_document: rangDoc,
      meilleure_similarite: r.extraits[0]?.similarity ?? null,
      elements_attendus: cas.elements_attendus,
      elements_presents: elementsPresents,
      complet: cas.elements_attendus.length > 0 && elementsPresents.length === cas.elements_attendus.length,
      refus_explicite: refus,
      hallucination,
      reponse,
      erreur: g.erreur ?? null,
      latences_ms: {
        embedding: Math.round(e.ms),
        recherche: Math.round(r.ms),
        generation: Math.round(g.ms),
        total: Math.round(e.ms + r.ms + g.ms),
      },
      jetons: g.jetons,
      modele_utilise: g.modele_utilise ?? null,
    })
    console.log(g.erreur ? `ERREUR (${g.erreur.slice(0, 40)})` : `ok — ${Math.round(e.ms + r.ms + g.ms)} ms`)
  } catch (err) {
    resultats.push({ id: cas.id, question: cas.question, categorie: cas.categorie, echec: String(err.message) })
    console.log(`ECHEC — ${err.message.slice(0, 60)}`)
  }
}

writeFileSync(
  process.argv[3] || 'evaluation/resultats.json',
  JSON.stringify({ date: new Date().toISOString(), modele: MODELE, seuil: SEUIL, nb_extraits: NB_EXTRAITS, resultats }, null, 2)
)

console.log(`\n${resultats.length} cas mesurés → evaluation/resultats.json`)
