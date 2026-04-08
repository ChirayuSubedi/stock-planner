'use client'

import { useState } from 'react'
import type { NewProduct } from '@/types/product'

interface Props {
  onSchliessen: () => void
  onErstellt: () => void
}

const LEER: NewProduct = {
  name: '', sku: '',
  stock_shop: 0, stock_amazon: 0, stock_transit: 0, stock_production: 0,
  lead_time_produktion: 0, lead_time_qi: 0, lead_time_verladung: 0,
  lead_time_import: 0, lead_time_verzollung: 0, lead_time_restocking: 0,
  daily_usage_shop: 0, daily_usage_amazon: 0,
  safety_stock: 0,
}

const ZAHLEN_FELDER: (keyof NewProduct)[] = [
  'stock_shop', 'stock_amazon', 'stock_transit', 'stock_production',
  'lead_time_produktion', 'lead_time_qi', 'lead_time_verladung',
  'lead_time_import', 'lead_time_verzollung', 'lead_time_restocking',
  'daily_usage_shop', 'daily_usage_amazon', 'safety_stock',
]

export default function ProduktHinzufuegenModal({ onSchliessen, onErstellt }: Props) {
  const [formular, setFormular] = useState<NewProduct>(LEER)
  const [speichern, setSpeichern] = useState(false)
  const [fehler, setFehler]       = useState<string | null>(null)

  function setzeWert<K extends keyof NewProduct>(schluessel: K, roh: string) {
    setFormular((prev) => ({
      ...prev,
      [schluessel]: ZAHLEN_FELDER.includes(schluessel)
        ? roh === '' ? 0 : Number(roh)
        : roh,
    }))
  }

  const leadTimeGesamt =
    formular.lead_time_produktion + formular.lead_time_qi +
    formular.lead_time_verladung  + formular.lead_time_import +
    formular.lead_time_verzollung + formular.lead_time_restocking

  const verbrauchGesamt = formular.daily_usage_shop + formular.daily_usage_amazon

  async function handleAbsenden(e: React.FormEvent) {
    e.preventDefault()
    setSpeichern(true)
    setFehler(null)

    try {
      const res = await fetch('/api/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formular),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.fehler ?? 'Produkt konnte nicht angelegt werden')
      onErstellt()
      onSchliessen()
    } catch (err) {
      setFehler(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setSpeichern(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onSchliessen}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Neues Produkt anlegen</h2>
            <p className="text-sm text-slate-500">Alle mit * markierten Felder sind Pflichtfelder</p>
          </div>
          <button onClick={onSchliessen}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <XIcon />
          </button>
        </div>

        {/* Formular */}
        <form onSubmit={handleAbsenden}>
          <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-6">
            {fehler && (
              <Fehlermeldung text={fehler} />
            )}

            {/* Stammdaten */}
            <Sektion titel="Stammdaten">
              <div className="grid grid-cols-2 gap-4">
                <Feld label="Produktname" required className="col-span-2">
                  <input value={formular.name}
                    onChange={(e) => setzeWert('name', e.target.value)}
                    className={eingabeKlasse} placeholder="z.B. Lernkarten Mathematik Klasse 1" required />
                </Feld>
                <Feld label="SKU" required>
                  <input value={formular.sku}
                    onChange={(e) => setzeWert('sku', e.target.value.toUpperCase())}
                    className={eingabeKlasse} placeholder="z.B. EDU-MATH-001" required />
                </Feld>
                <Feld label="Sicherheitsbestand (Stück)">
                  <input type="number" min="0" value={formular.safety_stock}
                    onChange={(e) => setzeWert('safety_stock', e.target.value)}
                    className={eingabeKlasse} />
                </Feld>
              </div>
            </Sektion>

            {/* Lagerbestände */}
            <Sektion titel="Lagerbestände (Stück)">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {([
                  ['stock_shop',       'Shop'],
                  ['stock_amazon',     'Amazon'],
                  ['stock_transit',    'Unterwegs'],
                  ['stock_production', 'In Produktion'],
                ] as const).map(([schluessel, label]) => (
                  <Feld key={schluessel} label={label}>
                    <input type="number" min="0" value={formular[schluessel]}
                      onChange={(e) => setzeWert(schluessel, e.target.value)}
                      className={eingabeKlasse} />
                  </Feld>
                ))}
              </div>
            </Sektion>

            {/* Vorlaufzeit */}
            <Sektion titel="Vorlaufzeit (Lead Time in Tagen)">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {([
                  ['lead_time_produktion', 'Produktion'],
                  ['lead_time_qi',         'Qualitätsprüfung (QI)'],
                  ['lead_time_verladung',  'Verladung'],
                  ['lead_time_import',     'Import'],
                  ['lead_time_verzollung', 'Verzollung'],
                  ['lead_time_restocking', 'Restocking'],
                ] as const).map(([schluessel, label]) => (
                  <Feld key={schluessel} label={label}>
                    <input type="number" min="0" value={formular[schluessel]}
                      onChange={(e) => setzeWert(schluessel, e.target.value)}
                      className={eingabeKlasse} />
                  </Feld>
                ))}
              </div>
              <GesamtAnzeige label="Lead Time gesamt" wert={`${leadTimeGesamt} Tage`} />
            </Sektion>

            {/* Verbrauch */}
            <Sektion titel="Tagesverbrauch (30-Tage-Schnitt, Einh./Tag)">
              <div className="grid grid-cols-2 gap-4">
                <Feld label="Shop">
                  <input type="number" min="0" step="0.01" value={formular.daily_usage_shop}
                    onChange={(e) => setzeWert('daily_usage_shop', e.target.value)}
                    className={eingabeKlasse} />
                </Feld>
                <Feld label="Amazon">
                  <input type="number" min="0" step="0.01" value={formular.daily_usage_amazon}
                    onChange={(e) => setzeWert('daily_usage_amazon', e.target.value)}
                    className={eingabeKlasse} />
                </Feld>
              </div>
              <GesamtAnzeige label="Verbrauch gesamt" wert={`${verbrauchGesamt.toFixed(2)} Einh./Tag`} />
            </Sektion>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={onSchliessen}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Abbrechen
            </button>
            <button type="submit" disabled={speichern}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {speichern ? 'Wird gespeichert …' : 'Produkt anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hilfs-Komponenten
// ---------------------------------------------------------------------------

const eingabeKlasse = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition'

function Sektion({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-600">{titel}</h3>
      {children}
    </section>
  )
}

function Feld({ label, required = false, className = '', children }: {
  label: string; required?: boolean; className?: string; children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function GesamtAnzeige({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-900">{wert}</span>
    </div>
  )
}

function Fehlermeldung({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {text}
    </div>
  )
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
