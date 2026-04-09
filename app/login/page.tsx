'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const weiter       = searchParams.get('next') ?? '/dashboard'

  const [passwort, setPasswort] = useState('')
  const [laden,    setLaden]    = useState(false)
  const [fehler,   setFehler]   = useState<string | null>(null)

  async function handleAbsenden(e: React.FormEvent) {
    e.preventDefault()
    setLaden(true)
    setFehler(null)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: passwort }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Anmeldung fehlgeschlagen')
      }

      router.push(weiter)
    } catch (err) {
      setFehler(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setLaden(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <BoxIcon className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold tracking-tight text-white">Stockplaner</span>
        </div>

        <div>
          <blockquote className="text-2xl font-light leading-relaxed text-slate-300">
            „Lagerreichweite im Blick. Nachbestellungen nie verpassen."
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">Edubini GmbH · Hamburg</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Produkte', wert: '24+' },
            { label: 'Kanäle',   wert: '2' },
            { label: 'Echtzeit', wert: '✓' },
          ].map(({ label, wert }) => (
            <div key={label} className="rounded-xl bg-slate-800 p-4">
              <p className="text-2xl font-bold text-white">{wert}</p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BoxIcon className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">Stockplaner</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Willkommen zurück</h1>
          <p className="mt-2 text-sm text-slate-500">
            Bitte gib das Passwort ein, um auf den Stockplaner zuzugreifen.
          </p>

          <form onSubmit={handleAbsenden} className="mt-8 space-y-4">
            <div>
              <label htmlFor="passwort" className="block text-sm font-medium text-slate-700">
                Passwort
              </label>
              <input
                id="passwort"
                type="password"
                autoFocus
                required
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {fehler && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {fehler}
              </div>
            )}

            <button
              type="submit"
              disabled={laden || !passwort}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {laden ? 'Anmelden …' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

export default function AnmeldungSeite() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
