import { Shield, Lock, EyeOff, FileText, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react'

export default function CguRgpdPage() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8">
      
      {/* Title */}
      <div className="border-b border-gray-100 dark:border-slate-800 pb-6 not-prose">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold mb-3">
          <Shield size={14} /> Protection maximale des données d&apos;entreprise
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          CGU & Politique de Protection des Données (RGPD)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Découvrez comment NexaMind AI protège votre corpus documentaire, assure l&apos;isolation stricte de vos échanges et respecte le Règlement Général sur la Protection des Données (RGPD / EU 2016/679).
        </p>
      </div>

      {/* 1. Engagement de Confidentialité IA (ZDR) */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <Cpu size={22} className="text-indigo-600 dark:text-indigo-400" />
          1. Intelligence Artificielle & Confidentialité des Corpus (Zero Data Retention)
        </h2>
        <p>
          L&apos;utilisation de modèles d&apos;intelligence artificielle (LLM) dans un cadre d&apos;entreprise nécessite des garanties techniques absolues. Lors de l&apos;utilisation de NexaMind AI :
        </p>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-start gap-3">
            <EyeOff className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Aucun entraînement sur vos données</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Les fournisseurs LLM tiers (OpenRouter / Google DeepMind) sont contractuellement obligatoirés de ne jamais conserver, stocker ni réutiliser vos documents et questions pour entraîner leurs modèles.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-start gap-3">
            <Lock className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Vectorisation Locale & Sécurisée</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                La découpe (chunking) et la transformation vectorielle (embeddings gte-small) sont réalisées au sein de conteneurs sécurisés côté serveur, garantissant l&apos;étanchéité de votre savoir-faire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Isolation des Données (RLS) */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <Lock size={22} className="text-purple-600 dark:text-purple-400" />
          2. Sécurité de l&apos;Infrastructure & Cloisonnement RLS
        </h2>
        <p>
          Conformément à l&apos;état de l&apos;art en matière de cybersécurité, NexaMind AI applique un cloisonnement strict par <strong>Row Level Security (RLS)</strong> au niveau de la base de données PostgreSQL. Chaque requête est authentifiée au niveau du moteur SQL : un collaborateur ou utilisateur ne peut en aucun cas consulter ni interroger des conversations, documents ou évaluations n&apos;appartenant pas à son périmètre autorisé.
        </p>
      </section>

      {/* 3. Droits RGPD & Données Personnelles */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <CheckCircle2 size={22} className="text-green-600 dark:text-green-400" />
          3. Exercice de vos Droits RGPD (CNIL)
        </h2>
        <p>
          Conformément aux articles 15 à 22 du Règlement (UE) 2016/679 du Parlement européen, vous disposez à tout moment des droits suivants concernant vos données à caractère personnel :
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
          <li><strong>Droit d&apos;accès :</strong> possibilité d&apos;obtenir une copie intégrale des informations stockées sur votre compte.</li>
          <li><strong>Droit de rectification :</strong> mise à jour immédiate des données de profil ou de configuration depuis vos paramètres.</li>
          <li><strong>Droit à l&apos;effacement (&laquo; Droit à l&apos;oubli &raquo;) :</strong> suppression définitive de votre profil, de vos historiques de chat et des fichiers téléversés.</li>
          <li><strong>Droit à la portabilité :</strong> extraction de votre historique de discussion et corpus au format brut (JSON / TXT).</li>
        </ul>
        <p className="text-sm">
          Pour exercer ces droits, vous pouvez vous adresser directement à votre administrateur système NexaWorks ou faire une demande par e-mail à : <strong className="text-indigo-600 dark:text-indigo-400">dpo@nexaworks.ai</strong> (Délégué à la Protection des Données). Nous nous engageons à répondre sous 30 jours calendaires.
        </p>
      </section>

      {/* 4. Gestion des Cookies */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <FileText size={22} className="text-amber-600 dark:text-amber-400" />
          4. Gestion des Cookies & Consentement
        </h2>
        <p>
          NexaMind AI a fait le choix d&apos;une architecture respectueuse de votre attention et de votre vie privée en éliminant les trackers marketing tiers :
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
          <li><strong>Cookies techniques strictement nécessaires (Exemptés de consentement) :</strong> utilisés par Supabase Authentication pour maintenir votre session chiffrée et sécurisée active.</li>
          <li><strong>Stockage de préférences locales (LocalStorage) :</strong> utilisé exclusivement pour enregistrer votre choix concernant le thème visuel (clair/sombre) et le statut d&apos;affichage de l&apos;alerte RGPD.</li>
        </ul>
      </section>

      {/* 5. Conditions de Service & Limitations */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <AlertTriangle size={22} className="text-red-500 dark:text-red-400" />
          5. Avertissement sur l&apos;IA Générative
        </h2>
        <p>
          Bien que le moteur de recherche par RAG de NexaMind AI restreigne les sources de l&apos;IA à votre base de connaissances validée afin de minimiser les hallucinations, un modèle linguistique statistique peut exceptionnellement produire des formulations inexactes ou incomplètes.
        </p>
        <p className="text-sm">
          L&apos;utilisateur d&apos;entreprise conserve en toutes circonstances la responsabilité éditoriale et légale de vérifier la précision des informations générées et de consulter les sources citées (cartes d&apos;indexation documentaires) avant toute diffusion ou décision professionnelle critique.
        </p>
      </section>

    </article>
  )
}
