'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/product'
import { produkteAnreichern } from '@/lib/stockMetrics'
import ProduktTabelle from './ProductTable'
import ProduktHinzufuegenModal from './AddProductModal'
import ProduktBearbeitenDrawer from './EditProductDrawer'

interface Props {
  initialProdukte: Product[]
}

export default function DashboardClient({ initialProdukte }: Props) {
  const router = useRouter()
  const [produkte,    setProdukte]    = useState<Product[]>(initialProdukte)
  const [modalOffen,  setModalOffen]  = useState(false)
  const [editProdukt, setEditProdukt] = useState<Product | null>(null)
  const [isPending,   startTransition] = useTransition()

  const aktualisieren = useCallback(() => {
    startTransition(() => router.refresh())
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => setProdukte(data))
      .catch(console.error)
  }, [router])

  function handleLoeschen(id: string) {
    setProdukte((prev) => prev.filter((p) => p.id !== id))
  }

  // Kennzahlen für Statistik-Karten
  const angereichert = useMemo(() => produkteAnreichern(produkte), [produkte])
  const statistiken = useMemo(() => ({
    gesamt:      angereichert.length,
    ueberfaellig: angereichert.filter((p) => p.nachbestell_status === 'Überfällig').length,
    dringend:    angereichert.filter((p) => p.nachbestell_status === 'Dringend').length,
    sicher:      angereichert.filter((p) => p.nachbestell_status === 'Sicher').length,
  }), [angereichert])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navigationsleiste ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">Stockplaner</span>
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline">Edubini GmbH</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPending && (
              <span className="hidden text-xs text-slate-400 sm:inline">Aktualisierung …</span>
            )}
            <button onClick={() => setModalOffen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition sm:px-4">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Produkt anlegen</span>
              <span className="sm:hidden">Neu</span>
            </button>
            <AbmeldenButton />
          </div>
        </div>
      </header>

      <main className="w-full space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">

        {/* ── Statistik-Karten ────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatKarte
            icon={<KastenIcon />}
            label="Produkte gesamt"
            wert={statistiken.gesamt}
            farbe="slate"
          />
          <StatKarte
            icon={<WarnIcon />}
            label="Überfällig"
            wert={statistiken.ueberfaellig}
            farbe="red"
            leer={statistiken.ueberfaellig === 0}
          />
          <StatKarte
            icon={<UhrIcon />}
            label="Dringend"
            wert={statistiken.dringend}
            farbe="amber"
            leer={statistiken.dringend === 0}
          />
          <StatKarte
            icon={<HakenIcon />}
            label="Sicher"
            wert={statistiken.sicher}
            farbe="green"
            leer={statistiken.sicher === 0}
          />
        </div>

        {/* ── Hinweis-Banner bei überfälligen Produkten ──── */}
        {statistiken.ueberfaellig > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-700">
              {statistiken.ueberfaellig === 1
                ? '1 Produkt ist überfällig — Nachbestellung sofort einleiten!'
                : `${statistiken.ueberfaellig} Produkte sind überfällig — Nachbestellungen sofort einleiten!`}
            </p>
          </div>
        )}

        {/* ── Tabelle ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Produktübersicht</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Alle Lagerreichweiten und Nachbestellfristen auf einen Blick
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {produkte.length} {produkte.length === 1 ? 'Produkt' : 'Produkte'}
            </span>
          </div>
          <div className="p-0">
            <ProduktTabelle
              produkte={produkte}
              onBearbeiten={setEditProdukt}
              onLoeschen={handleLoeschen}
            />
          </div>
        </div>

        {/* ── Fußzeile ─────────────────────────────────────────── */}
        <footer className="pb-4 text-center text-xs text-slate-400">
          Stockplaner · Edubini GmbH, Hamburg ·{' '}
          <span suppressHydrationWarning>
            Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </footer>
      </main>

      {/* ── Modal & Drawer ────────────────────────────────────── */}
      {modalOffen && (
        <ProduktHinzufuegenModal
          onSchliessen={() => setModalOffen(false)}
          onErstellt={aktualisieren}
        />
      )}

      <ProduktBearbeitenDrawer
        produkt={editProdukt}
        onSchliessen={() => setEditProdukt(null)}
        onAktualisiert={aktualisieren}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Statistik-Karte
// ---------------------------------------------------------------------------

const farbMap = {
  slate: { zahl: 'text-slate-900', bg: 'bg-slate-100', ring: '' },
  red:   { zahl: 'text-red-600',   bg: 'bg-red-100',   ring: 'ring-1 ring-red-200' },
  amber: { zahl: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-1 ring-amber-200' },
  green: { zahl: 'text-green-600', bg: 'bg-green-100', ring: 'ring-1 ring-green-200' },
}

function StatKarte({ icon, label, wert, farbe, leer = false }: {
  icon: React.ReactNode; label: string; wert: number
  farbe: keyof typeof farbMap; leer?: boolean
}) {
  const f = farbMap[farbe]
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition ${leer ? 'opacity-60' : ''}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.bg} ${f.ring}`}>
        <div className={f.zahl}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold tabular-nums ${f.zahl}`}>{wert}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Abmelden
// ---------------------------------------------------------------------------

function AbmeldenButton() {
  const router = useRouter()

  async function abmelden() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button onClick={abmelden}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition">
      Abmelden
    </button>
  )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function KastenIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632A2.25 2.25 0 0117.378 20H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

function UhrIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function HakenIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
