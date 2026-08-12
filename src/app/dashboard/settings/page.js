'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { User, Moon, Sun, Monitor, Bell, Shield, Search, History, Save, LogOut, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [userProfile, setUserProfile] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [fullName, setFullName] = useState('')
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'success' | 'error'
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setUserProfile({ ...user, ...profile })
        setFullName(profile?.full_name || '')

        // Fetch search history
        const { data: history } = await supabase
          .from('search_query')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        
        setSearchHistory(history || [])
      }
    }
    fetchUserData()
  }, [])

  const handleSaveProfile = async () => {
    if (!userProfile) return
    setSaveStatus('saving')
    setSaveError('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userProfile.id)

      if (error) throw error

      setSaveStatus('success')
      setUserProfile(prev => ({ ...prev, full_name: fullName }))
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err.message)
      setTimeout(() => setSaveStatus(null), 5000)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Paramètres & Historique</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte, vos préférences et consultez votre activité.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation verticale (Desktop) / Horizontale (Mobile) */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { id: 'profile', label: 'Mon Profil', icon: User },
              { id: 'appearance', label: 'Apparence', icon: Moon },
              { id: 'history', label: 'Historique d\'activité', icon: History },
              { id: 'security', label: 'Sécurité & Rôle', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          
          {/* Tab: Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations personnelles</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold uppercase overflow-hidden">
                  {fullName ? fullName.substring(0, 2) : userProfile?.email?.substring(0, 2) || 'UU'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                  <input type="email" defaultValue={userProfile?.email || ''} disabled className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none" />
                </div>
              </div>

              {/* Save feedback */}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-500/20">
                  <Check size={16} /> Profil mis à jour avec succès !
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={16} /> Erreur : {saveError}
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  <Save size={18} /> {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Apparence */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Thème de l'application</h2>
              
              {mounted && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'}`}
                  >
                    <Sun size={32} className={theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    <span className={`font-medium ${theme === 'light' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>Clair</span>
                  </button>

                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'}`}
                  >
                    <Moon size={32} className={theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>Sombre</span>
                  </button>

                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'}`}
                  >
                    <Monitor size={32} className={theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                    <span className={`font-medium ${theme === 'system' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>Système</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Historique */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historique d'activité</h2>
                <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">Effacer l'historique</button>
              </div>

              <div className="space-y-4">
                {searchHistory.length === 0 ? (
                  <p className="text-sm text-gray-400">Aucun historique de recherche</p>
                ) : (
                  searchHistory.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-slate-600">
                          <Search size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-200">{item.query_text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            Recherche sémantique • {item.results_count} résultat(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-500 sm:text-right">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sécurité & Autorisations</h2>
              
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-4 mb-6">
                <Shield className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 capitalize">Rôle : {userProfile?.role || 'user'}</h3>
                  <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 mt-1">Vous avez accès à la recherche et au chat. Vous ne pouvez gérer que les documents que vous avez importés.</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Modifier le mot de passe</span>
                  <span className="text-sm text-gray-400">Dernière modif. il y a 2 mois</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Double authentification (2FA)</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">Désactivée</span>
                </button>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800">
                <button className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-colors">
                  <LogOut size={18} /> Déconnexion de tous les appareils
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
