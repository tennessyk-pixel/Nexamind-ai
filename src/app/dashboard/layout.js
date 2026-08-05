'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Search, Library, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ressources', href: '/dashboard/resources', icon: Library },
    { name: 'Chat IA', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Recherche', href: '/dashboard/search', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-slate-900/70 border-r border-gray-200 dark:border-slate-800 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="p-6">
          <Link href="/dashboard" className="block">
            <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
              NexaMind AI
            </h2>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all">
            <Settings size={20} />
            Paramètres
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 mt-1 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-left">
            <LogOut size={20} />
            Déconnexion
          </button>

          {/* RGPD & Legal Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/60 flex flex-col gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 px-2">
            <div className="flex items-center justify-between">
              <span>© 2026 NexaWorks</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">RGPD 🔒</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-gray-400">
              <Link href="/legal/mentions-legales" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Mentions légales</Link>
              <span>•</span>
              <Link href="/legal/cgu" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">CGU / RGPD</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Navigation (Bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 z-50 px-2 pb-safe shadow-lg">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      
    </div>
  )
}
