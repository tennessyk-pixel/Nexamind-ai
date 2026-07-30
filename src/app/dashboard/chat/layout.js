'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Plus, Search, MoreHorizontal } from 'lucide-react'

export default function ChatLayout({ children }) {
  const pathname = usePathname()

  // Mock de l'historique des conversations
  const [conversations] = useState([
    { id: '1', title: 'Comment facturer un client ?', date: 'Aujourd\'hui' },
    { id: '2', title: 'Résumé réunion Atlas Q2', date: 'Hier' },
    { id: '3', title: 'Procédure onboarding', date: 'Il y a 3 jours' },
    { id: '4', title: 'Politique télétravail', date: 'Semaine dernière' }
  ])

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen w-full bg-white dark:bg-slate-950">
      
      {/* Sub-Sidebar : Historique des chats (Desktop uniquement pour simplifier, ou via un drawer sur mobile plus tard) */}
      <div className="hidden lg:flex flex-col w-80 border-r border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
          <Link 
            href="/dashboard/chat" 
            className="flex items-center justify-between w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl transition-all shadow-sm font-medium group"
          >
            <span className="flex items-center gap-2">
              <Plus size={18} /> Nouveau chat
            </span>
          </Link>
          
          <div className="relative mt-4 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Récents
          </div>
          {conversations.map((chat) => {
            const isActive = pathname === `/dashboard/chat/${chat.id}`
            return (
              <Link 
                key={chat.id} 
                href={`/dashboard/chat/${chat.id}`}
                className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  <span className="text-sm font-medium truncate">{chat.title}</span>
                </div>
                {isActive && (
                  <button className="shrink-0 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative">
        {children}
      </div>

    </div>
  )
}
