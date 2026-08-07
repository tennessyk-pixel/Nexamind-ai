'use client'

import { useState, useEffect, useCallback } from 'react'
import { UploadCloud, FileText, CheckCircle2, Clock, AlertCircle, Search, Plus, Trash2, AlignLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ResourcesPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [resources, setResources] = useState([])
  const [user, setUser] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'ready', 'pending'
  
  // États de traitement de l'IA (s48 / s49)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processResult, setProcessResult] = useState('')
  const [processTitle, setProcessTitle] = useState('')
  const [processActionType, setProcessActionType] = useState('')
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processError, setProcessError] = useState(null)
  const [relatedResources, setRelatedResources] = useState([])

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

  // Traiter un document avec l'IA (résumé ou points clés)
  const handleProcessResource = async (resource, actionType) => {
    setIsProcessing(true)
    setProcessError(null)
    setProcessResult('')
    setProcessTitle(resource.title)
    setProcessActionType(actionType)
    setShowProcessModal(true)
    setRelatedResources([])

    try {
      // 1. Lancer la génération IA
      const res = await fetch('/api/resources/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, action: actionType })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProcessResult(data.result || '')

      // 2. Récupérer les documents complémentaires liés
      const { data: relatedData, error: relatedErr } = await supabase.rpc('get_related_resources', {
        source_resource_id: resource.id,
        match_count: 3
      })
      if (!relatedErr && relatedData) {
        setRelatedResources(relatedData)
      }
    } catch (err) {
      console.error('Process resource failed:', err)
      setProcessError(err.message)
    } finally {
      setIsProcessing(false)
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
    <div className="flex-1 p-6 sm:p-12 w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b border-slate-300 dark:border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-slate-300 text-[10px] uppercase font-mono tracking-widest mb-4">
            <span className="w-2 h-2 bg-sky-500" />
            Vector DB
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter text-slate-900 dark:text-white">
            Base de Connaissances
          </h1>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase text-right hidden md:block">
          NOEUDS TOTAUX: {resources.length} <br/>
          SYNCHRONISÉS: {readyCount} / {resources.length}
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative border-2 border-dashed border-slate-300 dark:border-white/20 p-12 text-center bg-slate-100/50 dark:bg-white/[0.02] hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer group rounded-none mb-12"
      >
        <input 
          type="file" 
          onChange={onFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept=".pdf,.docx,.txt,.md"
          disabled={isUploading}
        />
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-6 group-hover:scale-105 transition-transform rounded-none">
          {isUploading ? (
            <Clock size={24} className="animate-spin" />
          ) : (
            <Plus size={24} />
          )}
        </div>
        <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
          {isUploading ? "TRAITEMENT EN COURS..." : "INSÉRER UNE NOUVELLE CONNAISSANCE"}
        </h3>
        <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mt-4">
          SUPPORTÉ: PDF, DOCX, TXT, MD. MAX 20MO.<br/>
          SERA AUTO-INDEXÉ PAR LE MOTEUR SÉMANTIQUE.
        </p>
        {uploadError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-mono tracking-widest border border-red-200 dark:border-red-500/30 mx-auto">
            [ERR] {uploadError}
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:max-w-sm group border-b border-slate-300 dark:border-white/20 focus-within:border-sky-500 transition-colors">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 text-sm"
            placeholder="Rechercher des documents..."
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto text-[10px] font-mono tracking-widest font-bold uppercase">
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`pb-2 border-b-2 transition-colors ${activeFilter === 'all' ? 'border-sky-500 text-sky-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            TOUS ({resources.length})
          </button>
          <button 
            onClick={() => setActiveFilter('ready')} 
            className={`pb-2 border-b-2 transition-colors ${activeFilter === 'ready' ? 'border-sky-500 text-sky-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            PRÊTS ({readyCount})
          </button>
          <button 
            onClick={() => setActiveFilter('pending')} 
            className={`pb-2 border-b-2 transition-colors ${activeFilter === 'pending' ? 'border-sky-500 text-sky-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            INDEXATION ({pendingCount})
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          {filteredResources.length === 0 ? (
            <div className="p-16 text-center text-[10px] font-mono tracking-widest uppercase text-slate-500">
              AUCUN DOCUMENT TROUVÉ.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-slate-500">Document</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-slate-500">Type</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-slate-500">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-mono tracking-widest uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 transition-colors rounded-none shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {resource.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                            {resource.file_type} • {(resource.file_size / 1024).toFixed(1)} KO
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                        {resource.source_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
                        {resource.index_status === 'ready' && <span className="text-sky-600 dark:text-sky-400">PRÊT</span>}
                        {resource.index_status === 'processing' && <span className="text-slate-400 animate-pulse">INDEXATION...</span>}
                        {resource.index_status === 'pending' && <span className="text-slate-400">EN ATTENTE</span>}
                        {resource.index_status === 'error' && <span className="text-red-500">ERREUR</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {resource.index_status === 'ready' && (
                          <>
                            <button 
                              onClick={() => handleProcessResource(resource, 'summarize')}
                              className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Résumé"
                            >
                              <AlignLeft size={16} />
                            </button>
                            <button 
                              onClick={() => handleProcessResource(resource, 'extract_points')}
                              className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Points Clés"
                            >
                              <Sparkles size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(resource)}
                          className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/20 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Flat Modal for AI Process Results */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-white/90 dark:bg-[#06080C]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#F8FAFC] dark:bg-[#0A0F1A] border border-slate-300 dark:border-white/10 rounded-none shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-300 dark:border-white/10 flex justify-between items-center bg-white dark:bg-white/5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-2 block">
                  [EXÉCUTION DU MOTEUR : {processActionType === 'summarize' ? 'RÉSUMÉ' : 'POINTS CLÉS'}]
                </span>
                <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white truncate max-w-lg">
                  {processTitle}
                </h3>
              </div>
              <button 
                onClick={() => setShowProcessModal(false)}
                className="text-[10px] font-mono tracking-widest uppercase px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-colors"
              >
                FERMER
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                  <div className="w-12 h-12 border-2 border-slate-200 dark:border-white/10 border-t-sky-500 animate-spin rounded-none" />
                  <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase animate-pulse">
                    TRAITEMENT EN COURS...
                  </p>
                </div>
              ) : processError ? (
                <div className="p-6 border border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-mono uppercase tracking-widest">
                  [ERREUR] {processError}
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-slate max-w-none text-slate-800 dark:text-slate-300 text-sm md:text-base leading-relaxed font-light whitespace-pre-line">
                  {processResult}
                </div>
              )}

              {/* Related Resources */}
              {!isProcessing && !processError && relatedResources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-white/10">
                  <h4 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-6">
                    RÉFÉRENCES CROISÉES:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedResources.map((related) => (
                      <div 
                        key={related.resource_id}
                        onClick={() => handleProcessResource({ id: related.resource_id, title: related.title }, processActionType)}
                        className="flex items-center gap-4 p-4 border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-sky-50 dark:hover:bg-white/5 hover:border-sky-500 transition-colors cursor-pointer group"
                      >
                        <div className="shrink-0 p-2 bg-slate-200 dark:bg-white/10 text-slate-500 group-hover:text-sky-500 transition-colors">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {related.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                            CORRESPONDANCE: {Math.round(related.max_similarity * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!isProcessing && !processError && processResult && (
              <div className="p-6 border-t border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(processResult)
                    alert('COPIÉ DANS LE PRESSE-PAPIERS')
                  }}
                  className="px-6 py-3 border border-slate-300 dark:border-white/20 text-[10px] font-mono tracking-widest uppercase font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  COPIER LE LOG
                </button>
                <button 
                  onClick={() => setShowProcessModal(false)}
                  className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity text-[10px] font-mono tracking-widest uppercase font-bold"
                >
                  ACQUITTER
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
