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
    { name: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
    { name: 'KNOWLEDGE BASE', href: '/dashboard/resources', icon: Library },
    { name: 'ENGINE CHAT', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'EXPLORE', href: '/dashboard/search', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#06080C] flex flex-col md:flex-row transition-colors duration-300 font-sans selection:bg-sky-500/30">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-transparent border-r border-slate-300 dark:border-white/5 h-screen sticky top-0 z-40">
        
        {/* LOGO AREA */}
        <div className="p-8 border-b border-slate-300 dark:border-white/5">
          <Link href="/dashboard" className="block">
            <h2 className="text-2xl font-semibold tracking-tighter text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              NexaMind
            </h2>
          </Link>
        </div>
        
        {/* NAVIGATION */}
        <nav className="flex-1 py-8 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`group flex items-center gap-4 px-8 py-3 transition-colors rounded-none border-l-2 ${
                  isActive 
                    ? 'border-sky-500 text-sky-600 dark:text-white bg-slate-200/50 dark:bg-white/5' 
                    : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/30 dark:hover:bg-white/[0.02]'
                }`}
              >
                <item.icon size={16} className={`${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300'} transition-colors`} />
                <span className="text-[10px] uppercase tracking-widest font-bold">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* BOTTOM AREA (Settings & Legal) */}
        <div className="border-t border-slate-300 dark:border-white/5">
          <div className="py-2">
            <Link href="/dashboard/settings" className="group flex items-center gap-4 px-8 py-3 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/30 dark:hover:bg-white/[0.02] transition-colors rounded-none">
              <Settings size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-bold">PARAMÈTRES</span>
            </Link>
            <button onClick={handleLogout} className="w-full group flex items-center gap-4 px-8 py-3 text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-none text-left">
              <LogOut size={16} className="text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-bold">DÉCONNEXION</span>
            </button>
          </div>

          {/* Technical Legal Footer */}
          <div className="p-8 border-t border-slate-300 dark:border-white/5 bg-slate-100 dark:bg-[#0A0F1A]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">SYS.VERSION 1.0</span>
                <span className="text-[9px] font-mono tracking-widest text-sky-600 dark:text-sky-400 uppercase border border-sky-600/30 px-1 py-0.5">SÉCURISÉ</span>
              </div>
              <div className="flex flex-col gap-1 mt-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                <Link href="/legal/mentions-legales" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">LÉGAL</Link>
                <Link href="/legal/cgu" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">DONNÉES</Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden relative">
        {children}
      </main>

      {/* Mobile Navigation (Bottom bar) - Sharplink minimal style */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#F8FAFC]/90 dark:bg-[#06080C]/90 backdrop-blur-xl border-t border-slate-300 dark:border-white/5 z-50 px-2 pb-safe shadow-2xl">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-none ${
                  isActive ? 'border-t-2 border-sky-500 text-sky-600 dark:text-white' : 'border-t-2 border-transparent text-slate-500 dark:text-slate-500'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-sky-500' : ''} />
              </Link>
            )
          })}
        </div>
      </nav>
      
    </div>
  )
}
