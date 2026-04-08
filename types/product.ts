// ============================================================
// Domain-Typen — spiegeln die `products`-Tabelle in Supabase wider
// ============================================================

export interface Product {
  id: string
  name: string
  sku: string

  // Lagerbestände je Kanal
  stock_shop: number
  stock_amazon: number
  stock_transit: number       // Unterwegs
  stock_production: number    // In Produktion

  // Vorlaufzeit aufgeschlüsselt (in Tagen)
  lead_time_produktion: number
  lead_time_qi: number          // Qualitätsprüfung / QI
  lead_time_verladung: number
  lead_time_import: number
  lead_time_verzollung: number
  lead_time_restocking: number

  // Tagesverbrauch pro Kanal (30-Tage-Durchschnitt)
  daily_usage_shop: number
  daily_usage_amazon: number

  // Planungsparameter
  safety_stock: number   // Sicherheitsbestand in Stück

  // Audit
  created_at: string
  updated_at: string
}

export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>

export type UpdateProduct = Partial<NewProduct>

// ============================================================
// Berechnete Planungswerte (zur Laufzeit berechnet, nicht gespeichert)
// ============================================================

export type NachbestellStatus = 'Überfällig' | 'Dringend' | 'Sicher'

export interface Lagerkennzahlen {
  // Berechnete Summen
  lagerbestand_gesamt: number         // Summe aller Kanäle
  lead_time_gesamt: number            // Summe aller Lead-Time-Phasen (Tage)
  daily_usage_gesamt: number          // Shop + Amazon (Einh./Tag)

  // Planungsergebnisse
  tage_reichweite: number             // Lagerbestand / Tagesverbrauch
  voraussichtlicher_ausverkauf: Date  // Heute + Tage Reichweite
  bestellfrist: Date                  // Ausverkaufsdatum − Lead Time gesamt
  nachbestell_status: NachbestellStatus
}

export type ProduktMitKennzahlen = Product & Lagerkennzahlen
