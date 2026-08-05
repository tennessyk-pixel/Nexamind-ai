'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, FileText, Search, MessageSquare, Clock, ThumbsUp } from 'lucide-react'
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
      // Compter les ressources actives
      const { count: totalCount } = await supabase
        .from('resource')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      const { count: readyCount } = await supabase
        .from('resource')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('index_status', 'ready')

      setResourceCount(totalCount || 0)
      setReadyPercent(totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0)

      // Charger les conversations récentes
      const { data: convs } = await supabase
        .from('conversation')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      setRecentConversations(convs || [])

      // Charger les statistiques de feedback IA
      const { data: feedbacks } = await supabase
        .from('feedback')
        .select('rating')

      if (feedbacks && feedbacks.length > 0) {
        const positives = feedbacks.filter(f => f.rating === 'positive').length
        setFeedbackStats({
          total: feedbacks.length,
          positivePercent: Math.round((positives / feedbacks.length) * 100)
        })
      }
    }
    fetchStats()
  }, [])

  // --- RENDU DU BLOC HERO (3 états) ---
  const renderHero = () => {
    if (dashboardState === 'first_visit') {
      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 sm:p-10 text-white shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center gap-3">
              Bienvenue sur NexaMind AI <Sparkles className="text-yellow-300 animate-pulse" size={32} />
            </h1>
            <p className="text-indigo-100 max-w-2xl text-lg mb-8 leading-relaxed">
              Votre nouveau copilote métier est prêt. Pour commencer, vous pouvez lui poser votre première question ou enrichir la base de connaissances avec vos propres documents.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/chat" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <MessageSquare size={20} /> Poser une question
              </Link>
              <Link href="/dashboard/resources" className="bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 text-white font-medium py-3.5 px-6 rounded-2xl transition-all flex items-center gap-2 backdrop-blur-md">
                <FileText size={20} /> Ajouter un document
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (dashboardState === 'returning_with_chat') {
      return (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-900/30 to-slate-900/10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Heureux de vous revoir ! 👋
              </h1>
              <p className="text-slate-400 max-w-xl text-lg">
                Vous avez une conversation en cours concernant <span className="text-indigo-300 font-medium px-1">"{recentChat.title}"</span>. Voulez-vous reprendre là où vous en étiez ?
              </p>
            </div>
            
            <Link href={`/dashboard/chat/${recentChat.id}`} className="group bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 px-7 rounded-2xl shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2 whitespace-nowrap shrink-0">
              Reprendre le chat <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      )
    }

    // Standard state
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 sm:p-10 shadow-sm transition-all duration-500">
        <div className="absolute top-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 h-full"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Bonjour ! Comment puis-je vous aider aujourd'hui ?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
            Recherchez dans la base de connaissances ou lancez un nouveau chat.
          </p>
          
          <div className="relative max-w-2xl group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
            </div>
            <input 
              type="text" 
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-lg shadow-sm"
              placeholder="Ex: Quelle est la procédure de facturation ?"
            />
          </div>
        </div>
      </div>
    )
  }

  // Déterminer l'état dynamique du hero
  const dashboardState = recentConversations.length > 0 ? 'returning_with_chat' : (resourceCount > 0 ? 'standard' : 'first_visit')
  const recentChat = recentConversations[0] || null

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Dynamic Hero Block */}
      {renderHero()}

      {/* Recent Activity / Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 text-lg">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Activité récente
            </h3>
            <Link href="/dashboard/chat" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Voir tout</Link>
          </div>
          <div className="space-y-4">
            {recentConversations.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Aucune activité récente</p>
            ) : (
              recentConversations.map((item) => (
                <Link key={item.id} href={`/dashboard/chat/${item.id}`} className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="bg-gray-100 dark:bg-slate-800 p-2.5 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <MessageSquare size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{item.title || 'Conversation sans titre'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 text-lg">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                <FileText size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              Base de connaissances
            </h3>
            <Link href="/dashboard/resources" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Gérer</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-all hover:bg-gray-100 dark:hover:bg-slate-800">
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-1.5">{resourceCount}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ressources actives</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
              <p className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-1.5">{readyPercent}%</p>
              <p className="text-sm font-medium text-indigo-600/80 dark:text-indigo-400/80">Indexé avec succès</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 text-lg">
                <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                  <ThumbsUp size={20} className="text-green-600 dark:text-green-400" />
                </div>
                Qualité & Feedbacks
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">RLHF</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-all hover:bg-gray-100 dark:hover:bg-slate-800">
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1.5">{feedbackStats.total}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Votes enregistrés</p>
              </div>
              <div className="bg-green-50 dark:bg-green-500/10 p-5 rounded-2xl border border-green-100 dark:border-green-500/20 transition-all hover:bg-green-100 dark:hover:bg-green-500/20">
                <p className="text-4xl font-black text-green-700 dark:text-green-400 mb-1.5">{feedbackStats.total > 0 ? `${feedbackStats.positivePercent}%` : '-'}</p>
                <p className="text-sm font-medium text-green-600/80 dark:text-green-400/80">Jugées utiles (👍)</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">
            Vos évaluations dans le chat permettent de mesurer la pertinence des réponses et d&apos;affiner continuellement l&apos;IA.
          </p>
        </div>
      </div>

    </div>
  )
}
