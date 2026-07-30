'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowRight, User, Bot, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export default function ChatConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  // Transport personnalisé pour passer le conversationId dans le body
  const transport = useRef(new DefaultChatTransport({
    api: '/api/chat',
    body: { conversationId: params.id }
  }))

  // Utilisation de useChat v4 (SDK ai@7 / @ai-sdk/react@4)
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: params.id,
    transport: transport.current,
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Bonjour, je suis NexaMind AI. Comment puis-je vous aider aujourd'hui ?",
        parts: [{ type: 'text', text: "Bonjour, je suis NexaMind AI. Comment puis-je vous aider aujourd'hui ?" }]
      }
    ],
    onError: (err) => {
      console.error('useChat error:', err)
    }
  })

  const [inputValue, setInputValue] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  // Soumettre automatiquement la question si elle est dans l'URL
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && historyLoaded && messages.length === 1) {
      window.history.replaceState({}, '', `/dashboard/chat/${params.id}`)
      sendMessage({ text: q })
    }
  }, [searchParams, historyLoaded, sendMessage, messages.length, params.id])

  // Charger l'historique de conversation depuis la base de données
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?conversationId=${params.id}`)
        if (res.ok) {
          const json = await res.json()
          if (json.messages && json.messages.length > 0) {
            setMessages(json.messages)
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err)
      } finally {
        setHistoryLoaded(true)
      }
    }
    loadHistory()
  }, [params.id, setMessages])

  // Scroll automatique vers le bas lors de l'arrivée de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Extraire le texte d'un message (compatible v4 parts-based)
  const getMessageText = (msg) => {
    if (msg.content && typeof msg.content === 'string') return msg.content
    if (msg.parts) {
      return msg.parts
        .filter(p => p.type === 'text')
        .map(p => p.text)
        .join('')
    }
    return ''
  }

  // Soumission du formulaire
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950/50">

      {/* Chat Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-10">
        <Link href="/dashboard/chat" className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
          Conversation #{params.id}
        </h2>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          ⚠️ Erreur : {error.message}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">

          {messages.map((msg, idx) => {
            const text = getMessageText(msg)

            return (
              <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {/* Avatar Assistant */}
                {msg.role === 'assistant' && (
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm mt-1">
                    <Bot size={20} />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 sm:px-5 py-3 rounded-2xl ${msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
                      }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
                      {text}
                    </div>
                  </div>
                </div>

                {/* Avatar User */}
                {msg.role === 'user' && (
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 mt-1">
                    <User size={20} />
                  </div>
                )}
              </div>
            )
          })}

          {/* Loader pendant le streaming */}
          {status === 'submitted' && (
            <div className="flex gap-4 justify-start">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm mt-1">
                <Bot size={20} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-tl-sm shadow-sm">
                <Loader2 size={20} className="animate-spin text-indigo-500" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-100 dark:border-slate-800">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-sm flex items-end p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (inputValue?.trim()) handleFormSubmit(e)
                }
              }}
              className="w-full max-h-48 min-h-[56px] bg-transparent border-0 px-4 py-4 text-gray-900 dark:text-white resize-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 scrollbar-thin"
              placeholder="Répondre à NexaMind AI..."
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue?.trim()}
              className="shrink-0 m-2 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            NexaMind AI peut commettre des erreurs. Vérifiez les informations générées et les sources citées.
          </p>
        </form>
      </div>

    </div>
  )
}
