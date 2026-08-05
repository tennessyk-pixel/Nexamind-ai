import Link from 'next/link'
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react'

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Container */}
      <div className="max-w-4xl mx-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Retour au Tableau de bord</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle size={14} />
            <span>Conforme RGPD & CNIL</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 space-x-4">
          <Link href="/legal/mentions-legales" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Mentions légales</Link>
          <span>•</span>
          <Link href="/legal/cgu" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">CGU & Politique RGPD</Link>
          <span>•</span>
          <span>© 2026 NexaWorks — Tous droits réservés</span>
        </div>

      </div>
    </div>
  )
}
