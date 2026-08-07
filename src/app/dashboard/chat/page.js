'use client'

import { useState } from 'react'
import { ArrowRight, Terminal, Database, FileCode, Command } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewChatPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')

  const handleNewChat = (customPrompt = prompt) => {
    const newId = crypto.randomUUID()
    if (customPrompt.trim()) {
      router.push(`/dashboard/chat/${newId}?q=${encodeURIComponent(customPrompt)}`)
    } else {
      router.push(`/dashboard/chat/${newId}`)
    }
  }
  
  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 w-full max-w-[1200px] mx-auto h-[calc(100vh-64px)] md:h-screen animate-in fade-in duration-500">
      
      <div className="flex-1 overflow-y-auto pb-12 mt-12 md:mt-24">
        
        {/* HEADER */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-slate-300 text-[10px] uppercase font-mono tracking-widest mb-6">
            <span className="w-2 h-2 bg-sky-500 animate-pulse" />
            Moteur Prêt
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter text-slate-900 dark:text-white mb-4">
            Initialiser la Session
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl font-light">
            Interrogez le graphe de connaissances. Accédez aux documents, procédures et au contexte interne.
          </p>
        </div>

        {/* SUGGESTED QUERIES (Terminal style lists) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 w-full max-w-4xl">
          {[
            { title: "EXTRAIRE LE RÉSUMÉ", desc: "La procédure d'onboarding RH", icon: FileCode },
            { title: "GÉNÉRER UN BROUILLON", desc: "Pour annoncer les résultats Q3", icon: Terminal },
            { title: "REQUÊTE BDD", desc: "Quelle est la politique de télétravail ?", icon: Database },
            { title: "CRÉER UN MODÈLE", desc: "Pour une fiche de poste développeur", icon: Command }
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => handleNewChat(item.desc)}
              className="group flex flex-col text-left border-l-2 border-slate-200 dark:border-white/10 hover:border-sky-500 pl-6 py-2 transition-colors"
            >
              <div className="flex items-center gap-3 mb-1">
                <item.icon size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                <span className="font-bold text-[10px] tracking-widest text-slate-600 dark:text-slate-300 uppercase">{item.title}</span>
              </div>
              <span className="text-slate-900 dark:text-white text-sm mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
        
      </div>

      {/* INPUT AREA (Flat, Sharp, Brutal) */}
      <div className="w-full shrink-0 pt-4 bg-[#F8FAFC] dark:bg-[#06080C]">
        <div className="flex items-end border border-slate-300 dark:border-white/10 focus-within:border-sky-500 transition-colors bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm">
          <div className="px-4 py-4 self-center text-slate-400">
            <Command size={18} />
          </div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleNewChat()
              }
            }}
            className="flex-1 max-h-[40vh] min-h-[56px] bg-transparent border-0 py-4 text-slate-900 dark:text-white text-lg resize-none outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-white/20 placeholder:font-light scrollbar-thin"
            placeholder="Saisissez votre instruction..."
            rows={1}
          />
          <button 
            onClick={() => handleNewChat()}
            className="shrink-0 flex items-center justify-center bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors px-6 self-stretch min-h-[56px] rounded-none"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-3 px-1">
          <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            [SYS.WARN] L'IA PEUT PRODUIRE DES RÉPONSES INEXACTES
          </p>
          <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            APPUYEZ SUR ENTRÉE ↵
          </p>
        </div>
      </div>
      
    </div>
  )
}
