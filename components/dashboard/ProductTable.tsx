'use client'

import { useMemo, useState } from 'react'
import type { Product, ProduktMitKennzahlen } from '@/types/product'
import { produkteAnreichern } from '@/lib/stockMetrics'
import StatusBadge from './StatusBadge'

interface Props {
  produkte: Product[]
  onBearbeiten: (produkt: Product) => void
  onLoeschen: (id: string) => void
}

const datumFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'short', year: 'numeric',
})

function formatDatum(datum: Date): string {
  return datum.getFullYear() > 2030 ? '∞' : datumFormat.format(datum)
}

type SortierKey = keyof ProduktMitKennzahlen

export default function ProduktTabelle({ produkte, onBearbeiten, onLoeschen }: Props) {
  const [suche,      setSuche]      = useState('')
  const [sortKey,    setSortKey]    = useState<SortierKey>('name')
  const [sortAufst,  setSortAufst]  = useState(true)
  const [loeschId,   setLoeschId]   = useState<string | null>(null)
  const [loeschenLaden, setLoeschenLaden] = useState(false)

  const angereichert = useMemo(() => produkteAnreichern(produkte), [produkte])

  const gefiltert = useMemo(() => {
    const q = suche.toLowerCase()
    if (!q) return angereichert
    return angereichert.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    )
  }, [angereichert, suche])

  const sortiert = useMemo(() => {
    return [...gefiltert].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av instanceof Date && bv instanceof Date) {
        return sortAufst ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime()
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAufst ? av - bv : bv - av
      }
      return sortAufst
        ? String(av).localeCompare(String(bv), 'de')
        : String(bv).localeCompare(String(av), 'de')
    })
  }, [gefiltert, sortKey, sortAufst])

  function umschaltenSort(key: SortierKey) {
    if (sortKey === key) setSortAufst(!sortAufst)
    else { setSortKey(key); setSortAufst(true) }
  }

  async function bestätigenLoeschen(id: string) {
    setLoeschenLaden(true)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    onLoeschen(id)
    setLoeschId(null)
    setLoeschenLaden(false)
  }

  const statusZeileKlasse: Record<string, string> = {
    Überfällig: 'row-overdue',
    Dringend:   'row-urgent',
    Sicher:     'row-safe',
  }

  return (
    <div className="space-y-4">
      {/* Suchzeile */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Suche nach SKU oder Produktname …"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
        {suche && (
          <span className="text-sm text-slate-500">
            {sortiert.length} Ergebnis{sortiert.length !== 1 ? 'se' : ''}
          </span>
        )}
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="bg-slate-50">
              {spalten.map(({ key, label, rechts }) => (
                <Spaltenkopf key={key} label={label} rechts={rechts}
                  aktiv={sortKey === key} aufsteigend={sortAufst}
                  onClick={() => umschaltenSort(key as SortierKey)} />
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortiert.length === 0 ? (
              <tr>
                <td colSpan={spalten.length + 1}
                  className="py-16 text-center text-sm text-slate-400">
                  {suche
                    ? 'Kein Produkt entspricht der Suche.'
                    : 'Noch keine Produkte vorhanden. Lege das erste Produkt an.'}
                </td>
              </tr>
            ) : (
              sortiert.map((p) => (
                <tr key={p.id}
                  className={`group transition-colors hover:bg-slate-50/80 ${statusZeileKlasse[p.nachbestell_status] ?? ''}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.stock_shop.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.stock_amazon.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.stock_transit.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.stock_production.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{p.lagerbestand_gesamt.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.daily_usage_gesamt.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`tabular-nums font-semibold ${p.tage_reichweite === Infinity ? 'text-slate-400' : p.tage_reichweite < 20 ? 'text-red-600' : p.tage_reichweite < 45 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {p.tage_reichweite === Infinity ? '∞' : p.tage_reichweite}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatDatum(p.voraussichtlicher_ausverkauf)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatDatum(p.bestellfrist)}</td>
                  <td className="px-4 py-3">{/* Lead Time */}
                    <span className="tabular-nums text-slate-500">{p.lead_time_gesamt} T</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.nachbestell_status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => onBearbeiten(p)}
                      className="mr-1 rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition">
                      Bearbeiten
                    </button>
                    <button onClick={() => setLoeschId(p.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition">
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Löschbestätigung */}
      {loeschId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Produkt löschen?</h3>
                <p className="text-sm text-slate-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setLoeschId(null)} disabled={loeschenLaden}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Abbrechen
              </button>
              <button onClick={() => bestätigenLoeschen(loeschId)} disabled={loeschenLaden}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition">
                {loeschenLaden ? 'Wird gelöscht …' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Spaltendefinitionen (deutsch)
// ---------------------------------------------------------------------------

const spalten: { key: string; label: string; rechts?: boolean }[] = [
  { key: 'sku',                          label: 'SKU' },
  { key: 'name',                         label: 'Produkt' },
  { key: 'stock_shop',                   label: 'Shop',         rechts: true },
  { key: 'stock_amazon',                 label: 'Amazon',       rechts: true },
  { key: 'stock_transit',                label: 'Unterwegs',    rechts: true },
  { key: 'stock_production',             label: 'In Produktion',rechts: true },
  { key: 'lagerbestand_gesamt',          label: 'Gesamt',       rechts: true },
  { key: 'daily_usage_gesamt',           label: 'Verbr./Tag',   rechts: true },
  { key: 'tage_reichweite',              label: 'Tage',         rechts: true },
  { key: 'voraussichtlicher_ausverkauf', label: 'Ausverkauf',   rechts: true },
  { key: 'bestellfrist',                 label: 'Bestellfrist', rechts: true },
  { key: 'lead_time_gesamt',             label: 'Lead Time',    rechts: false },
  { key: 'nachbestell_status',           label: 'Status' },
]

function Spaltenkopf({ label, rechts, aktiv, aufsteigend, onClick }: {
  label: string; rechts?: boolean; aktiv: boolean; aufsteigend: boolean; onClick: () => void
}) {
  return (
    <th onClick={onClick}
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition ${rechts ? 'text-right' : 'text-left'}`}>
      {label}{aktiv && <span className="ml-1 text-blue-500">{aufsteigend ? '↑' : '↓'}</span>}
    </th>
  )
}
