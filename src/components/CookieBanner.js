'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Cookie, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérification du consentement en local
    const consent = localStorage.getItem('nexamind_rgpd_consent')
    if (!consent) {
      // Retard d'affichage pour une apparition fluide
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleConsent = (choice) => {
    localStorage.setItem('nexamind_rgpd_consent', choice)
    localStorage.setItem('nexamind_rgpd_timestamp', new Date().toISOString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 text-gray-800 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <Cookie size={22} />
          </div>
          <span>Confidentialité & RGPD</span>
        </div>
        <button 
          onClick={() => handleConsent('dismissed')}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        NexaMind AI respecte scrupuleusement votre vie privée. Nous utilisons uniquement des cookies techniques essentiels pour sécuriser votre connexion (Supabase Auth) et mémoriser vos préférences (thème sombre/clair). <strong className="font-semibold text-gray-900 dark:text-white">Aucun traçage publicitaire ou revente de données n&apos;est effectué.</strong>
      </p>

      {/* Links & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-slate-800/80">
        <Link 
          href="/legal/cgu" 
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <ShieldCheck size={14} />
          <span>Notre politique RGPD</span>
          <ExternalLink size={12} />
        </Link>

        <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
          <button
            onClick={() => handleConsent('refused_optional')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => handleConsent('accepted_all')}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            Tout accepter
          </button>
        </div>
      </div>

    </div>
  )
}
