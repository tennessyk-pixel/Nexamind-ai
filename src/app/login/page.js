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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px] opacity-60"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 dark:bg-indigo-500/10 blur-[100px] opacity-60"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden p-8 transition-all duration-300">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
              NexaMind AI
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isLogin ? 'Connectez-vous pour accéder à votre espace' : 'Créez votre compte pour commencer'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                placeholder="vous@entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-4 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-transparent transition-all duration-300"></div>
              <span className="relative flex items-center justify-center">
                {isPending ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  isLogin ? 'Se connecter' : 'S\'inscrire'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Vous n\'avez pas de compte ? ' : 'Vous avez déjà un compte ? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}
