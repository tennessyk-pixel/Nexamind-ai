import { Building2, Server, UserCheck, ShieldAlert, Mail } from 'lucide-react'

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8">
      
      {/* Title */}
      <div className="border-b border-gray-100 dark:border-slate-800 pb-6 not-prose">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Mentions Légales
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          En vigueur au 1er janvier 2026 — Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;économie numérique (LCEN).
        </p>
      </div>

      {/* 1. Éditeur du site */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <Building2 size={22} className="text-indigo-600 dark:text-indigo-400" />
          1. Éditeur de l&apos;application (NexaMind AI)
        </h2>
        <p>
          L&apos;application web <strong>NexaMind AI</strong> est éditée par la société <strong>NexaWorks SAS</strong>, société par actions simplifiée au capital de 50 000 €, immatriculée au Registre du Commerce et des Sociétés (RCS) sous le numéro unique 987 654 321.
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
          <li><strong>Siège social :</strong> 42 Avenue des Technologies, 75001 Paris, France</li>
          <li><strong>Numéro de TVA intracommunautaire :</strong> FR88987654321</li>
          <li><strong>Contact e-mail :</strong> contact@nexaworks.ai</li>
          <li><strong>Téléphone :</strong> +33 (0)1 23 45 67 89</li>
        </ul>
      </section>

      {/* 2. Directeur de la publication */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <UserCheck size={22} className="text-purple-600 dark:text-purple-400" />
          2. Direction de la Publication
        </h2>
        <p>
          Le Directeur de la publication de la plateforme NexaMind AI est le Président de NexaWorks SAS en exercice. Pour toute question éditoriale ou demande officielle, contactez : <strong>direction@nexaworks.ai</strong>.
        </p>
      </section>

      {/* 3. Hébergement du service */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <Server size={22} className="text-green-600 dark:text-green-400" />
          3. Hébergement de l&apos;infrastructure
        </h2>
        <p>
          L&apos;application et ses bases de données sont hébergées sur des infrastructures sécurisées dans l&apos;Union Européenne :
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
          <li>
            <strong>Application Web & API (Next.js) :</strong> Hébergée sur les serveurs de la société <em>Vercel Inc.</em> (440 N Barranca Ave #4133, Covina, CA 91723, USA) avec CDN globalisé et terminaisons en Europe (Frankfurt/Paris).
          </li>
          <li>
            <strong>Base de Données & Stockage Documentaire (PostgreSQL / PGVector) :</strong> Hébergée chez <em>Supabase Inc.</em> sur des instances AWS certifiées ISO 27001 situées au sein de l&apos;Union Européenne.
          </li>
        </ul>
      </section>

      {/* 4. Propriété intellectuelle */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <ShieldAlert size={22} className="text-amber-600 dark:text-amber-400" />
          4. Propriété Intellectuelle
        </h2>
        <p>
          L&apos;ensemble de ce site et de l&apos;application NexaMind AI (structure, code source, algorithmes RAG, graphismes, logos, bases de données et documentations) relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification ou adaptation totale ou partielle de l&apos;application sans autorisation expresse de <strong>NexaWorks SAS</strong> est formellement interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
        </p>
      </section>

      {/* Contact */}
      <div className="p-6 bg-indigo-50/50 dark:bg-slate-800/50 rounded-2xl border border-indigo-100 dark:border-slate-700 not-prose mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Une question juridique ou technique ?</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Notre équipe juridique et de conformité est à votre disposition.</p>
        </div>
        <a href="mailto:legal@nexaworks.ai" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0">
          <Mail size={16} /> Contacter le service juridique
        </a>
      </div>

    </article>
  )
}
