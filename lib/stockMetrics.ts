import type { Product, Lagerkennzahlen, NachbestellStatus, ProduktMitKennzahlen } from '@/types/product'

/** Nachbestellwarnung ab weniger als X Tagen bis zur Bestellfrist */
const DRINGEND_SCHWELLE_TAGE = 10

/**
 * berechneLagerkennzahlen
 * ----------------------
 * Kernlogik des Stockplaners (Anforderung B).
 *
 * Formeln
 *   lagerbestand_gesamt   = Shop + Amazon + Unterwegs + In Produktion
 *   lead_time_gesamt      = Produktion + QI + Verladung + Import + Verzollung + Restocking
 *   daily_usage_gesamt    = Shop + Amazon (30-Tage-Schnitt)
 *   tage_reichweite       = ⌊ lagerbestand_gesamt / daily_usage_gesamt ⌋
 *   voraussichtl. Ausverkauf = Heute + Tage Reichweite
 *   Bestellfrist          = Ausverkaufsdatum − Lead Time gesamt
 *
 * Nachbestell-Status
 *   'Überfällig' → Bestellfrist < heute
 *   'Dringend'   → Bestellfrist < heute + 10 Tage
 *   'Sicher'     → sonst
 */
export function berechneLagerkennzahlen(
  produkt: Pick<
    Product,
    | 'stock_shop' | 'stock_amazon' | 'stock_transit' | 'stock_production'
    | 'lead_time_produktion' | 'lead_time_qi' | 'lead_time_verladung'
    | 'lead_time_import' | 'lead_time_verzollung' | 'lead_time_restocking'
    | 'daily_usage_shop' | 'daily_usage_amazon'
  >,
  heute: Date = new Date()
): Lagerkennzahlen {
  // Summen berechnen
  const lagerbestand_gesamt =
    produkt.stock_shop +
    produkt.stock_amazon +
    produkt.stock_transit +
    produkt.stock_production

  const lead_time_gesamt =
    produkt.lead_time_produktion +
    produkt.lead_time_qi +
    produkt.lead_time_verladung +
    produkt.lead_time_import +
    produkt.lead_time_verzollung +
    produkt.lead_time_restocking

  const daily_usage_gesamt =
    produkt.daily_usage_shop + produkt.daily_usage_amazon

  // Reichweite und Termine berechnen
  const tage_reichweite =
    daily_usage_gesamt > 0
      ? Math.floor(lagerbestand_gesamt / daily_usage_gesamt)
      : Infinity

  const voraussichtlicher_ausverkauf = addTage(
    heute,
    tage_reichweite === Infinity ? 3650 : tage_reichweite
  )
  const bestellfrist = addTage(voraussichtlicher_ausverkauf, -lead_time_gesamt)

  // Nachbestell-Status ermitteln
  const tagesBisBestellfrist = tagsDifferenz(heute, bestellfrist)
  let nachbestell_status: NachbestellStatus
  if (tagesBisBestellfrist < 0) {
    nachbestell_status = 'Überfällig'
  } else if (tagesBisBestellfrist < DRINGEND_SCHWELLE_TAGE) {
    nachbestell_status = 'Dringend'
  } else {
    nachbestell_status = 'Sicher'
  }

  return {
    lagerbestand_gesamt,
    lead_time_gesamt,
    daily_usage_gesamt,
    tage_reichweite,
    voraussichtlicher_ausverkauf,
    bestellfrist,
    nachbestell_status,
  }
}

/** Berechnung an ein einzelnes Produkt anhängen */
export function produktMitKennzahlen(produkt: Product, heute?: Date): ProduktMitKennzahlen {
  return { ...produkt, ...berechneLagerkennzahlen(produkt, heute) }
}

/** Berechnung an eine Liste von Produkten anhängen */
export function produkteAnreichern(produkte: Product[], heute?: Date): ProduktMitKennzahlen[] {
  const ref = heute ?? new Date()
  return produkte.map((p) => produktMitKennzahlen(p, ref))
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function addTage(datum: Date, tage: number): Date {
  const d = new Date(datum)
  d.setDate(d.getDate() + tage)
  return d
}

/** Positive = Datum liegt in der Zukunft, negativ = in der Vergangenheit */
function tagsDifferenz(von: Date, bis: Date): number {
  const MS_PRO_TAG = 1000 * 60 * 60 * 24
  return Math.floor((bis.getTime() - von.getTime()) / MS_PRO_TAG)
}
