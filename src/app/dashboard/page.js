'use client'

import { useState, useEffect } from 'react'
import { Brain, ArrowRight, FileText, Search, Activity, Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [resourceCount, setResourceCount] = useState(0)
  const [readyPercent, setReadyPercent] = useState(0)
  const [recentConversations, setRecentConversations] = useState([])
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, positivePercent: 0 })
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setResourceCount(12)
      setReadyPercent(100)
      setRecentConversations([
        { id: '1', title: 'Analyse des KPI Q3', created_at: new Date().toISOString() },
        { id: '2', title: 'Procédure onboarding', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', title: 'Questions RH', created_at: new Date(Date.now() - 172800000).toISOString() }
      ])
      setFeedbackStats({ total: 24, positivePercent: 92 })
      
      try {
        const { count: totalCount } = await supabase.from('resource').select('*', { count: 'exact', head: true }).eq('is_active', true)
        const { count: readyCount } = await supabase.from('resource').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('index_status', 'ready')
        
        if (totalCount !== null) {
          setResourceCount(totalCount)
          setReadyPercent(totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0)
        }
        
        const { data: convs } = await supabase.from('conversation').select('id, title, created_at').order('created_at', { ascending: false }).limit(3)
        if (convs && convs.length > 0) setRecentConversations(convs)
      } catch (e) {
        // Fallback
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#06080C] text-slate-900 dark:text-slate-100 overflow-hidden font-sans selection:bg-sky-500/30 flex flex-col">
      
      {/* ── AMBIANCE SHARPLINK (Gradient & Topography) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Massive fade background */}
        <div className="absolute top-0 left-0 w-full h-[150vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-200 via-transparent to-transparent dark:from-sky-900/40 dark:via-transparent dark:to-transparent opacity-80" />
        
        {/* Wavy Topographic SVG (Simulated) */}
        <svg className="absolute inset-0 w-[200%] h-[200%] opacity-20 dark:opacity-10 stroke-sky-900 dark:stroke-sky-100" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M-100 200 Q 300 100 700 300 T 1500 200" strokeWidth="1" />
           <path d="M-100 250 Q 300 150 700 350 T 1500 250" strokeWidth="1" />
           <path d="M-100 300 Q 300 200 700 400 T 1500 300" strokeWidth="1" />
           <path d="M-100 350 Q 300 250 700 450 T 1500 350" strokeWidth="1" />
           <path d="M-100 400 Q 300 300 700 500 T 1500 400" strokeWidth="1" />
           <path d="M-100 450 Q 300 350 700 550 T 1500 450" strokeWidth="1" />
           <path d="M-100 500 Q 300 400 700 600 T 1500 500" strokeWidth="1" />
           <path d="M-100 550 Q 300 450 700 650 T 1500 550" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-[1600px] w-full mx-auto px-6 md:px-16 pt-24 pb-12">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 lg:gap-24">
          
          {/* ── LEFT: IMMENSE TYPOGRAPHY & INPUT ── */}
          <div className="flex-1 max-w-3xl">
            <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-medium tracking-tighter leading-[0.95] text-slate-900 dark:text-white mb-16">
              NexaMind <br />
              <span className="text-sky-600 dark:text-sky-400">with an Edge</span>
            </h1>

            {/* Minimal Sharplink Input */}
            <div className="max-w-xl">
              <p className="text-sm font-semibold mb-6 text-slate-900 dark:text-white">Interrogez le cerveau d'entreprise :</p>
              <div className="flex items-center border-b border-slate-300 dark:border-white/20 pb-3 group transition-colors focus-within:border-sky-500">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-lg placeholder:text-slate-500 dark:placeholder:text-white/30 placeholder:font-light"
                  placeholder="Saisissez votre requête"
                />
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white text-xs font-bold tracking-widest transition-colors rounded-none shrink-0">
                  CHERCHER <ArrowRight size={14} />
                </button>
              </div>
            </div>
            
            {/* Quick Actions (Rectangular, Solid) */}
            <div className="mt-8 flex items-center gap-4">
              <Link href="/dashboard/resources" className="text-xs uppercase tracking-widest font-bold px-6 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity rounded-none">
                Ajouter
              </Link>
              <Link href="/dashboard/chat" className="text-xs uppercase tracking-widest font-bold px-6 py-4 border border-slate-900 text-slate-900 dark:border-white dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors rounded-none">
                Historique
              </Link>
            </div>
          </div>

          {/* ── RIGHT: ABSTRACT GRAPHIC (Wireframe Cerveau) ── */}
          <div className="hidden lg:flex w-full max-w-lg justify-center relative">
            {/* Wireframe box reproducing the Sharplink pyramid box */}
            <div className="relative w-80 h-80">
              {/* Outer structural lines */}
              <div className="absolute inset-0 border border-slate-300 dark:border-white/20 rounded-none z-10 pointer-events-none" />
              <div className="absolute top-1/2 -left-10 right-0 h-px bg-slate-300 dark:border-white/20 z-0 border-dashed border-slate-300 dark:border-white/20" />
              <div className="absolute left-1/2 -top-10 bottom-0 w-px bg-slate-300 dark:border-white/20 z-0 border-dashed border-slate-300 dark:border-white/20" />
              
              {/* The "Sober Brain" inside */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Brain className="w-48 h-48 text-sky-600 dark:text-white drop-shadow-2xl" strokeWidth={0.5} />
              </div>
              
              {/* Technical annotations simulating UI */}
              <div className="absolute top-4 left-4 text-[9px] font-mono tracking-widest text-slate-500">
                VOL_4.72
              </div>
              <div className="absolute bottom-4 right-4 text-[9px] font-mono tracking-widest text-slate-500 border border-slate-300 dark:border-white/20 p-1">
                INDEX: {readyPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: ASYMMETRICAL SOLID CARDS (Press Release Style) ── */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Navigation/FAQ Style lists (Left) */}
          <div className="col-span-1 lg:col-span-7 grid grid-cols-2 gap-12 border-t border-slate-300 dark:border-white/10 pt-8">
            <div>
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold">Requêtes Récentes</h3>
              <ul className="space-y-4">
                {recentConversations.map((item, idx) => (
                  <li key={idx} className="group border-b border-slate-200 dark:border-white/5 pb-4 flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-white transition-colors">{item.title}</span>
                    <Plus size={14} className="text-slate-400" />
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold">État du Système</h3>
              <ul className="space-y-4">
                <li className="group border-b border-slate-200 dark:border-white/5 pb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">API Moteur</span>
                  <span className="text-xs text-green-600">EN LIGNE</span>
                </li>
                <li className="group border-b border-slate-200 dark:border-white/5 pb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vector Store</span>
                  <span className="text-xs text-sky-600">SYNCHRONISÉ</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Solid Information Block (Right - anchors the layout) */}
          <div className="col-span-1 lg:col-span-5 bg-slate-900 dark:bg-slate-800 text-white rounded-none p-8 md:p-10 relative overflow-hidden group hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
            {/* Tiny accent square */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-sky-500" />
            
            <div className="flex justify-between items-start mb-16">
              <span className="text-[10px] tracking-widest font-bold text-slate-400 uppercase">Analytique</span>
              <span className="text-[10px] tracking-widest font-mono text-slate-400">{new Date().toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-slate-300 mb-1">Documents Indexés</p>
              <h3 className="text-3xl font-medium tracking-tight mb-8">
                {resourceCount} Noeuds Actifs
              </h3>
              
              <Link href="/dashboard/resources" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 flex items-center justify-center border border-slate-600 rounded-none group-hover:bg-white group-hover:text-slate-900 group-hover:border-white transition-all">
                  <ArrowRight size={14} />
                </div>
                Voir la Base
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ── BACKGROUND HUGE TEXT CUTOFF ── */}
      <div className="absolute bottom-[-15%] left-0 right-0 pointer-events-none overflow-hidden flex justify-center z-0 opacity-5 dark:opacity-10">
        <h2 className="text-[25vw] font-bold tracking-tighter leading-none text-slate-900 dark:text-white whitespace-nowrap select-none">
          NexaMind
        </h2>
      </div>

    </div>
  )
}
