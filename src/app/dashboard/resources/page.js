'use client'

import { useState, useEffect, useCallback } from 'react'
import { UploadCloud, FileText, CheckCircle2, Clock, AlertCircle, Search, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ResourcesPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [resources, setResources] = useState([])
  const [user, setUser] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'ready', 'pending'
  const supabase = createClient()

  // Récupérer la session utilisateur et charger les ressources au montage
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    fetchResources()
  }, [])

  // Récupérer la liste des ressources depuis la DB
  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resource')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (data) {
      setResources(data)
    }
  }

  // Uploader un fichier et déclencher son indexation par l'IA
  const handleFileUpload = async (file) => {
    if (!file || !user) return
    
    setIsUploading(true)
    setUploadError(null)

    try {
      // 1. Envoyer le fichier dans Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Insérer l'enregistrement dans la table `resource`
      let sourceType = 'document'
      if (fileExt === 'pdf') sourceType = 'document'
      else if (fileExt === 'md' || fileExt === 'txt') sourceType = 'note'
      else if (fileExt === 'docx') sourceType = 'procedure'

      const { data: insertData, error: dbError } = await supabase
        .from('resource')
        .insert({
          user_id: user.id,
          title: file.name.split('.')[0].substring(0, 100),
          source_type: sourceType,
          file_url: filePath,
          file_type: fileExt,
          file_size: file.size,
          index_status: 'pending' // Initial status
        })
        .select()

      if (dbError) throw dbError

      // 3. Déclencher le pipeline de vectorisation RAG
      const insertedResource = insertData?.[0]
      if (insertedResource) {
        // Rafraîchir la liste immédiatement pour afficher le statut "processing"
        fetchResources()

        const ingestResponse = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceId: insertedResource.id })
        })

        if (!ingestResponse.ok) {
          const errData = await ingestResponse.json()
          throw new Error(errData.error || "Erreur lors de l'indexation par l'IA.")
        }
      }

      // Rafraîchissement final (statut "ready")
      fetchResources()

    } catch (error) {
      console.error('Upload failed:', error)
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Supprimer un document (soft delete conforme au dossier de conception RM-004)
  const handleDelete = async (resource) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${resource.title}" ? Cette action masquera le document.`)) return

    try {
      // Soft delete : marquer la ressource comme inactive
      const { error: dbError } = await supabase
        .from('resource')
        .update({ is_active: false })
        .eq('id', resource.id)

      if (dbError) throw dbError

      // Rafraîchir la liste
      fetchResources()

    } catch (error) {
      console.error('Delete failed:', error)
      alert(`Erreur lors de la suppression : ${error.message}`)
    }
  }

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Helper pour afficher le badge de statut
  const getStatusBadge = (status) => {
    switch(status) {
      case 'ready':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"><CheckCircle2 size={12} /> Prêt</span>
      case 'processing':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20"><Clock size={12} className="animate-spin" /> Indexation...</span>
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"><AlertCircle size={12} /> Erreur</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"><Clock size={12} /> En attente</span>
    }
  }

  // Formater la date en français
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  // Filtrer et rechercher dans les ressources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeFilter === 'ready') return matchesSearch && resource.index_status === 'ready'
    if (activeFilter === 'pending') return matchesSearch && ['pending', 'processing'].includes(resource.index_status)
    return matchesSearch
  })

  // Calculer les comptes réels
  const readyCount = resources.filter(r => r.index_status === 'ready').length
  const pendingCount = resources.filter(r => ['pending', 'processing'].includes(r.index_status)).length

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bibliothèque</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les documents et connaissances accessibles par l'IA.</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-10 sm:p-14 text-center bg-gray-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer group"
      >
        <input 
          type="file" 
          onChange={onFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept=".pdf,.docx,.txt,.md"
          disabled={isUploading}
        />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 mb-5 group-hover:scale-110 group-hover:shadow-md transition-all">
          {isUploading ? (
            <Clock size={36} className="text-indigo-500 animate-spin" />
          ) : (
            <UploadCloud size={36} className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
          {isUploading ? "Indexation par l'IA en cours..." : "Cliquez ou glissez un document ici"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Formats supportés : PDF, Word (docx), Markdown, Texte (max 20 Mo). 
          Le document sera automatiquement découpé et indexé pour la recherche sémantique.
        </p>
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20 max-w-md mx-auto">
            {uploadError}
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
            placeholder="Rechercher un document par nom..."
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            Tous ({resources.length})
          </button>
          <button 
            onClick={() => setActiveFilter('ready')} 
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeFilter === 'ready' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-100 dark:border-slate-800'}`}
          >
            Prêts ({readyCount})
          </button>
          <button 
            onClick={() => setActiveFilter('pending')} 
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeFilter === 'pending' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-100 dark:border-slate-800'}`}
          >
            En indexation ({pendingCount})
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredResources.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Aucun document trouvé
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-5">Document</th>
                  <th className="px-6 py-5">Type de source</th>
                  <th className="px-6 py-5">Statut</th>
                  <th className="px-6 py-5">Ajouté le</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                            {resource.title}
                          </p>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                            {resource.file_type} • {(resource.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex text-xs font-medium text-gray-600 dark:text-gray-300 capitalize bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-slate-700/50">
                        {resource.source_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(resource.index_status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(resource.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(resource)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        title="Supprimer la ressource"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
