'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, signupAction } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const action = isLogin ? loginAction : signupAction
      const result = await action(formData)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/dashboard')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#06080C] relative overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Background Topography (Simulated) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10">
        <svg className="absolute inset-0 w-[200%] h-[200%] stroke-slate-900 dark:stroke-white" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M-100 200 Q 300 100 700 300 T 1500 200" strokeWidth="0.5" />
           <path d="M-100 250 Q 300 150 700 350 T 1500 250" strokeWidth="0.5" />
           <path d="M-100 300 Q 300 200 700 400 T 1500 300" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-white/50 dark:bg-[#0A0F1A]/50 border border-slate-300 dark:border-white/10 rounded-none overflow-hidden backdrop-blur-xl">
          
          <div className="p-8 border-b border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">
            <h1 className="text-3xl font-semibold tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
              NexaMind
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              {isLogin ? 'AUTHENTIFICATION SYSTÈME REQUISE' : 'INITIALISATION DE COMPTE'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2" htmlFor="email">
                  IDENTIFIANT (EMAIL)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:ring-0 focus:border-sky-500 transition-colors outline-none font-mono text-sm placeholder:text-slate-400/50"
                  placeholder="utilisateur@entreprise.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2" htmlFor="password">
                  CLÉ D'ACCÈS (MOT DE PASSE)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-white/10 bg-transparent text-slate-900 dark:text-white focus:ring-0 focus:border-sky-500 transition-colors outline-none font-mono text-sm placeholder:text-slate-400/50"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-[10px] font-mono tracking-widest uppercase border border-red-200 dark:border-red-500/30">
                  [AUTH ERR] {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-4 px-4 hover:opacity-90 transition-opacity rounded-none disabled:opacity-50 text-[10px] font-mono tracking-widest uppercase mt-4 flex justify-center items-center"
              >
                {isPending ? (
                  <span className="animate-pulse">TRAITEMENT EN COURS...</span>
                ) : (
                  isLogin ? 'S\'AUTHENTIFIER' : 'CRÉER LE NOEUD'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-300 dark:border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
                className="text-[10px] font-mono tracking-widest uppercase text-sky-600 dark:text-sky-400 hover:underline"
              >
                {isLogin ? 'DEMANDER L\'ACCÈS (S\'INSCRIRE)' : 'RETOUR À LA CONNEXION'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
