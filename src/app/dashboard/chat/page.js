'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Zap, Shield, Search } from 'lucide-react'
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-4xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-10 mt-10 sm:mt-0">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mb-6 shadow-indigo-500/20">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Comment puis-je vous aider ?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Posez une question sur vos documents internes ou demandez-moi de rédiger un texte basé sur la base de connaissances de l'entreprise.
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12 max-w-3xl">
        {[
          { title: "Résumer un document", desc: "La procédure d'onboarding RH", icon: Search },
          { title: "Rédiger un email", desc: "Pour annoncer les résultats Q3", icon: Zap },
          { title: "Trouver une information", desc: "Quelle est la politique de télétravail ?", icon: Shield },
          { title: "Générer un template", desc: "Pour une fiche de poste développeur", icon: Sparkles }
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => handleNewChat(item.desc)}
            className="group flex flex-col text-left p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <item.icon size={18} className="text-indigo-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{item.desc}</span>
          </button>
        ))}
      </div>

      {/* Input area mockup */}
      <div className="w-full max-w-3xl mt-auto md:mt-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl rounded-full"></div>
        <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-xl flex items-end p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleNewChat()
              }
            }}
            className="w-full max-h-48 min-h-[56px] bg-transparent border-0 px-4 py-4 text-gray-900 dark:text-white resize-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 scrollbar-thin"
            placeholder="Posez votre question à NexaMind AI..."
            rows={1}
          />
          <button 
            onClick={() => handleNewChat()}
            className="shrink-0 m-2 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-4 px-4">
          L'IA peut faire des erreurs. Pensez à vérifier les informations importantes et les sources citées.
        </p>
      </div>
    </div>
  )
}
