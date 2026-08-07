'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal, FileText, ExternalLink, Sparkles, MessageSquare, BookOpen, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const supabase = createClient()

  const fetchRecentSearches = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('search_query')
        .select('id, query_text')
        .order('created_at', { ascending: false })
        .limit(4)
      setRecentSearches(data || [])
    }
  }

  useEffect(() => {
    fetchRecentSearches()
  }, [])

  const handleSearch = async (e, overrideQuery = null) => {
    if (e?.preventDefault) e.preventDefault()
    
    const queryToUse = overrideQuery !== null ? overrideQuery : searchQuery
    
    if (queryToUse.trim().length > 0) {
      setHasSearched(true)
      setIsSearching(true)
      setError(null)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryToUse })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setResults(data.results || [])
        fetchRecentSearches()
      } catch (err) {
        setError(err.message)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    } else {
      setHasSearched(false)
      setResults([])
    }
  }

  // Couleurs selon le score de pertinence
  const getRelevanceColor = (score) => {
    if (score >= 90) return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
    if (score >= 75) return 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
    return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'faq': return <MessageSquare size={16} />
      case 'document': return <BookOpen size={16} />
      default: return <FileText size={16} />
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-12 w-full max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] animate-in fade-in duration-500">
      
      {/* Search Header / Search Bar */}
      <div className={`transition-all duration-700 ease-in-out flex flex-col items-start w-full mx-auto ${hasSearched ? 'mt-0 mb-12' : 'mt-24 sm:mt-40 mb-0'}`}>
        
        {!hasSearched && (
          <div className="mb-12 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-slate-300 text-[10px] uppercase font-mono tracking-widest mb-6">
              <span className="w-2 h-2 bg-sky-500" />
              Moteur Sémantique
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter text-slate-900 dark:text-white mb-4">
              Explorer les données
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl font-light">
              Recherche profonde à travers l'ensemble des procédures indexées et de la documentation interne.
            </p>
          </div>
        )}

        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="flex items-end border-b-2 border-slate-300 dark:border-white/20 focus-within:border-sky-500 transition-colors pb-2">
            <div className="px-4 py-2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 px-2 py-4 text-slate-900 dark:text-white text-xl md:text-2xl outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-white/20 placeholder:font-light"
              placeholder="Interroger la base de données..."
            />
            <button 
              type="submit" 
              className="ml-4 px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity text-[10px] font-mono tracking-widest uppercase font-bold rounded-none shrink-0"
            >
              EXÉCUTER
            </button>
          </div>
        </form>

        {/* Quick filters (mock) */}
        {!hasSearched && (
          <div className="flex flex-wrap items-center gap-4 mt-8 animate-in fade-in duration-700 delay-200">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">CIBLES RAPIDES:</span>
            <button onClick={() => { setSearchQuery('Télétravail'); handleSearch(null, 'Télétravail') }} className="px-4 py-2 border border-slate-300 dark:border-white/10 text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Télétravail</button>
            <button onClick={() => { setSearchQuery('Congés payés'); handleSearch(null, 'Congés payés') }} className="px-4 py-2 border border-slate-300 dark:border-white/10 text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Congés payés</button>
            <button onClick={() => { setSearchQuery('Mutuelle'); handleSearch(null, 'Mutuelle') }} className="px-4 py-2 border border-slate-300 dark:border-white/10 text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Mutuelle</button>
          </div>
        )}

        {/* Recherches récentes (réelles) */}
        {!hasSearched && recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-6 animate-in fade-in duration-700 delay-300">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <Clock size={12} /> HISTORIQUE:
            </span>
            {recentSearches.map((search) => (
              <button 
                key={search.id} 
                onClick={() => { setSearchQuery(search.query_text); handleSearch(null, search.query_text) }} 
                className="text-[10px] font-mono tracking-widest uppercase text-sky-600 dark:text-sky-400 hover:underline"
              >
                {search.query_text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results Area */}
      {hasSearched && (
        <div className="w-full mx-auto animate-in fade-in duration-500">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-300 dark:border-white/10 gap-4">
            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              {isSearching ? 'ANALYSE DU SYSTÈME...' : `[${results.length}] NOEUDS CORRESPONDANTS: `}
              {!isSearching && <span className="text-sky-600 dark:text-sky-400 font-bold">{searchQuery}</span>}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">TRIER PAR:</span>
              <select className="bg-transparent text-[10px] font-mono tracking-widest uppercase text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-2 py-1 outline-none rounded-none cursor-pointer">
                <option>PERTINENCE</option>
                <option>DATE</option>
              </select>
            </div>
          </div>

            {error && (
              <div className="p-6 border border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-mono uppercase tracking-widest mb-8">
                [ERR] {error}
              </div>
            )}
            {!isSearching && results.length === 0 && !error && (
              <div className="text-center text-[10px] font-mono tracking-widest uppercase text-slate-500 py-16 border border-slate-300 dark:border-white/10">
                NO MATCHING RECORDS FOUND IN INDEX.
              </div>
            )}
            
            <div className="space-y-6">
              {!isSearching && results.map((result) => {
                const relevanceScore = Math.round(result.similarity * 100)
                
                const highlightText = (text, query) => {
                  if (!query) return text
                  const words = query.split(' ').filter(w => w.length > 2)
                  if (words.length === 0) return text
                  
                  let highlighted = text
                  words.forEach(word => {
                    const regex = new RegExp(`(${word})`, 'gi')
                    highlighted = highlighted.replace(regex, '<mark class="bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-none px-1">$1</mark>')
                  })
                  return highlighted
                }
                
                return (
                <div key={result.chunk_id} className="group border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 hover:border-sky-500 transition-colors p-6 sm:p-8 cursor-pointer rounded-none relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-sky-500 transition-colors"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-slate-200 dark:bg-white/10 text-slate-500 group-hover:text-sky-500 transition-colors shrink-0">
                        {getTypeIcon('document')}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors flex items-center gap-2">
                          {result.resource_title}
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-[10px] font-mono tracking-widest text-slate-500 mt-1 uppercase">DOCUMENT</p>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-white/10 text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent">
                      MATCH: <span className="text-sky-600 dark:text-sky-400 font-bold">{relevanceScore}%</span>
                    </div>
                  </div>

                  <div 
                    className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-14 prose dark:prose-invert font-light"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.content, searchQuery) }}
                  />
                </div>
              )})}
            </div>
          
        </div>
      )}

    </div>
  )
}
