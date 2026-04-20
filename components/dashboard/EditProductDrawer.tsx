'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'

interface Props {
  produkt: Product | null
  onSchliessen: () => void
  onAktualisiert: () => void
}

type FormState = {
  stock_shop: number; stock_amazon: number; stock_transit: number; stock_production: number
  lead_time_produktion: number; lead_time_qi: number; lead_time_verladung: number
  lead_time_import: number; lead_time_verzollung: number; lead_time_restocking: number
  daily_usage_shop: number; daily_usage_amazon: number
  safety_stock: number
}

const FORM_STANDARD: FormState = {
  stock_shop: 0, stock_amazon: 0, stock_transit: 0, stock_production: 0,
  lead_time_produktion: 0, lead_time_qi: 0, lead_time_verladung: 0,
  lead_time_import: 0, lead_time_verzollung: 0, lead_time_restocking: 0,
  daily_usage_shop: 0, daily_usage_amazon: 0, safety_stock: 0,
}

export default function ProduktBearbeitenDrawer({ produkt, onSchliessen, onAktualisiert }: Props) {
  const [form, setForm]         = useState<FormState>(FORM_STANDARD)
  const [speichern, setSpeichern] = useState(false)
  const [fehler, setFehler]     = useState<string | null>(null)

  useEffect(() => {
    if (produkt) {
      setForm({
        stock_shop:           produkt.stock_shop,
        stock_amazon:         produkt.stock_amazon,
        stock_transit:        produkt.stock_transit,
        stock_production:     produkt.stock_production,
        lead_time_produktion: produkt.lead_time_produktion,
        lead_time_qi:         produkt.lead_time_qi,
        lead_time_verladung:  produkt.lead_time_verladung,
        lead_time_import:     produkt.lead_time_import,
        lead_time_verzollung: produkt.lead_time_verzollung,
        lead_time_restocking: produkt.lead_time_restocking,
        daily_usage_shop:     produkt.daily_usage_shop,
        daily_usage_amazon:   produkt.daily_usage_amazon,
        safety_stock:         produkt.safety_stock,
      })
      setFehler(null)
    }
  }, [produkt])

  function setzeWert(schluessel: keyof FormState, roh: string) {
    setForm((prev) => ({ ...prev, [schluessel]: roh === '' ? 0 : Number(roh) }))
  }

  const leadTimeGesamt =
    form.lead_time_produktion + form.lead_time_qi + form.lead_time_verladung +
    form.lead_time_import + form.lead_time_verzollung + form.lead_time_restocking

  const verbrauchGesamt = form.daily_usage_shop + form.daily_usage_amazon

  async function handleSpeichern() {
    if (!produkt) return
    setSpeichern(true)
    setFehler(null)

    try {
      const res = await fetch(`/api/products/${produkt.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? json.fehler ?? `Fehler ${res.status}`)
      }
      onAktualisiert()
      onSchliessen()
    } catch (err) {
      setFehler(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setSpeichern(false)
    }
  }

  const offen = produkt !== null

  return (
    <>
      {offen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onSchliessen} />
      )}

      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${offen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Produkt bearbeiten</h2>
              {produkt && (
                <p className="mt-0.5 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{produkt.name}</span>
                  {' · '}
                  <span className="font-mono text-xs">{produkt.sku}</span>
                </p>
              )}
            </div>
            <button onClick={onSchliessen}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {fehler && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fehler}
            </div>
          )}

          {/* Vorlaufzeit — primary edit target per requirements */}
          <DrawerSektion titel="Vorlaufzeit (Lead Time)" akzent>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['lead_time_produktion', 'Produktion'],
                ['lead_time_qi',         'Qualitätsprüfung (QI)'],
                ['lead_time_verladung',  'Verladung'],
                ['lead_time_import',     'Import'],
                ['lead_time_verzollung', 'Verzollung'],
                ['lead_time_restocking', 'Restocking'],
              ] as const).map(([schluessel, label]) => (
                <DrawerFeld key={schluessel} label={`${label} (Tage)`}>
                  <input type="number" min="0" value={form[schluessel]}
                    onChange={(e) => setzeWert(schluessel, e.target.value)}
                    className={eingabeKlasse} />
                </DrawerFeld>
              ))}
            </div>
            <GesamtBox label="Lead Time gesamt" wert={`${leadTimeGesamt} Tage`} />
          </DrawerSektion>

          {/* Tagesverbrauch — primary edit target per requirements */}
          <DrawerSektion titel="Tagesverbrauch (30-Tage-Schnitt)" akzent>
            <div className="grid grid-cols-2 gap-3">
              <DrawerFeld label="Shop (Einh./Tag)">
                <input type="number" min="0" step="0.01" value={form.daily_usage_shop}
                  onChange={(e) => setzeWert('daily_usage_shop', e.target.value)}
                  className={eingabeKlasse} />
              </DrawerFeld>
              <DrawerFeld label="Amazon (Einh./Tag)">
                <input type="number" min="0" step="0.01" value={form.daily_usage_amazon}
                  onChange={(e) => setzeWert('daily_usage_amazon', e.target.value)}
                  className={eingabeKlasse} />
              </DrawerFeld>
            </div>
            <GesamtBox label="Verbrauch gesamt" wert={`${verbrauchGesamt.toFixed(2)} Einh./Tag`} />
          </DrawerSektion>

          {/* Lagerbestände */}
          <DrawerSektion titel="Lagerbestände (Stück)">
            <div className="grid grid-cols-2 gap-3">
              {([
                ['stock_shop',       'Lager Shop'],
                ['stock_amazon',     'Lager Amazon'],
                ['stock_transit',    'Unterwegs'],
                ['stock_production', 'In Produktion'],
              ] as const).map(([schluessel, label]) => (
                <DrawerFeld key={schluessel} label={label}>
                  <input type="number" min="0" value={form[schluessel]}
                    onChange={(e) => setzeWert(schluessel, e.target.value)}
                    className={eingabeKlasse} />
                </DrawerFeld>
              ))}
            </div>
          </DrawerSektion>

          {/* Sicherheitsbestand */}
          <DrawerSektion titel="Sicherheitsbestand">
            <DrawerFeld label="Mindestbestand (Stück)" className="max-w-xs">
              <input type="number" min="0" value={form.safety_stock}
                onChange={(e) => setzeWert('safety_stock', e.target.value)}
                className={eingabeKlasse} />
            </DrawerFeld>
          </DrawerSektion>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onSchliessen}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            Abbrechen
          </button>
          <button onClick={handleSpeichern} disabled={speichern}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
            {speichern ? 'Wird gespeichert …' : 'Änderungen speichern'}
          </button>
        </div>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Hilfs-Komponenten
// ---------------------------------------------------------------------------

const eingabeKlasse = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition'

function DrawerSektion({ titel, akzent = false, children }: { titel: string; akzent?: boolean; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className={`text-xs font-semibold uppercase tracking-widest ${akzent ? 'text-blue-600' : 'text-slate-400'}`}>
        {titel}
      </h3>
      {children}
    </section>
  )
}

function DrawerFeld({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}

function GesamtBox({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5 ring-1 ring-blue-100">
      <span className="text-xs font-medium text-blue-600">{label}</span>
      <span className="text-sm font-bold text-blue-700">{wert}</span>
    </div>
  )
}
