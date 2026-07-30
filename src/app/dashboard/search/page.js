'use client'

import { useState } from 'react'
import { Search, Filter, SlidersHorizontal, FileText, ExternalLink, Sparkles, MessageSquare, BookOpen } from 'lucide-react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    
    if (searchQuery.trim().length > 0) {
      setHasSearched(true)
      setIsSearching(true)
      setError(null)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setResults(data.results || [])
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
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Search Header / Search Bar */}
      <div className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full max-w-3xl mx-auto ${hasSearched ? 'mt-0 mb-8' : 'mt-20 sm:mt-32 mb-0'}`}>
        
        {!hasSearched && (
          <div className="text-center mb-10 animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6">
              <Search size={40} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Recherche Sémantique
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Posez votre question ou tapez des mots-clés. L'IA fouillera le contenu exact de tous vos documents pour trouver la meilleure réponse.
            </p>
          </div>
        )}

        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Sparkles className="text-indigo-500 animate-pulse" size={24} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-32 py-5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-lg shadow-xl shadow-gray-200/50 dark:shadow-none"
            placeholder="Ex: Quelle est l'indemnité de télétravail ?"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
              <SlidersHorizontal size={22} />
            </button>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-md"
            >
              Chercher
            </button>
          </div>
        </form>

        {/* Quick filters (mock) */}
        {!hasSearched && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-in fade-in duration-700 delay-200">
            <span className="text-sm font-medium text-gray-500">Recherches fréquentes :</span>
            <button onClick={() => { setSearchQuery('Télétravail'); setTimeout(() => handleSearch({ preventDefault: () => {} }), 0) }} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-gray-700 dark:text-gray-300">Télétravail</button>
            <button onClick={() => { setSearchQuery('Congés payés'); setTimeout(() => handleSearch({ preventDefault: () => {} }), 0) }} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-gray-700 dark:text-gray-300">Congés payés</button>
            <button onClick={() => { setSearchQuery('Mutuelle'); setTimeout(() => handleSearch({ preventDefault: () => {} }), 0) }} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-gray-700 dark:text-gray-300">Mutuelle</button>
          </div>
        )}
      </div>

      {/* Search Results Area */}
      {hasSearched && (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {isSearching ? 'Recherche en cours...' : `${results.length} résultat(s) trouvé(s) pour `}
              {!isSearching && <span className="text-indigo-600 dark:text-indigo-400 font-bold">"{searchQuery}"</span>}
            </p>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 outline-none cursor-pointer">
                <option>Pertinence</option>
                <option>Plus récent</option>
              </select>
            </div>
          </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl">Erreur: {error}</div>
            )}
            {!isSearching && results.length === 0 && !error && (
              <div className="text-center text-gray-500 py-10">Aucun résultat trouvé pour votre recherche.</div>
            )}
            {!isSearching && results.map((result) => {
              const relevanceScore = Math.round(result.similarity * 100)
              
              // Surligner les mots-clés dans le contenu
              const highlightText = (text, query) => {
                if (!query) return text
                const words = query.split(' ').filter(w => w.length > 2)
                if (words.length === 0) return text
                
                let highlighted = text
                words.forEach(word => {
                  const regex = new RegExp(`(${word})`, 'gi')
                  highlighted = highlighted.replace(regex, '<mark class="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded px-1">$1</mark>')
                })
                return highlighted
              }
              
              return (
              <div key={result.chunk_id} className="group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-slate-800 p-2.5 rounded-xl text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {getTypeIcon('document')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        {result.resource_title}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Document</p>
                    </div>
                  </div>
                  
                  {/* Score de pertinence */}
                  <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold shadow-sm ${getRelevanceColor(relevanceScore)}`}>
                    <Sparkles size={14} /> {relevanceScore}% Match
                  </div>
                </div>

                <div 
                  className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed pl-14 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: highlightText(result.content, searchQuery) }}
                />
              </div>
            )})}
          
        </div>
      )}

    </div>
  )
}
