/**
 * Seed-Skript — Stockplaner
 *
 * Befüllt die Produkttabelle mit realistischen Edubini-Produkten,
 * die alle drei Nachbestell-Status abdecken (Überfällig, Dringend, Sicher).
 *
 * Verwendung:
 *   npm run seed
 *
 * Voraussetzung: .env.local mit NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import type { NewProduct } from '../types/product'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Beispielprodukte — Edubini Lernmaterialien
// Verschiedene Szenarien für die Demonstration des Dashboards
// ---------------------------------------------------------------------------
const produkte: NewProduct[] = [
  // ✅ Sicher — gute Reichweite
  {
    name: 'Lernkarten Mathe Klasse 1–2',
    sku: 'EDU-MATH-001',
    stock_shop: 320, stock_amazon: 210, stock_transit: 120, stock_production: 0,
    lead_time_produktion: 25, lead_time_qi: 5, lead_time_verladung: 7,
    lead_time_import: 14, lead_time_verzollung: 3, lead_time_restocking: 4,
    // Lead Time gesamt: 58 Tage
    daily_usage_shop: 8.5, daily_usage_amazon: 6.2,  // ~14.7 Einh./Tag
    safety_stock: 150,
  },
  // ✅ Sicher — hoher Bestand in Produktion
  {
    name: 'ABC-Lernspielpuzzle Vorschule',
    sku: 'EDU-READ-002',
    stock_shop: 180, stock_amazon: 95, stock_transit: 0, stock_production: 400,
    lead_time_produktion: 30, lead_time_qi: 7, lead_time_verladung: 10,
    lead_time_import: 18, lead_time_verzollung: 5, lead_time_restocking: 5,
    // Lead Time gesamt: 75 Tage
    daily_usage_shop: 5.0, daily_usage_amazon: 3.8,
    safety_stock: 100,
  },
  // ⚠️ Dringend — Bestellfrist naht
  {
    name: 'Englisch Vokabel-Flashcards A1',
    sku: 'EDU-ENG-003',
    stock_shop: 45, stock_amazon: 18, stock_transit: 0, stock_production: 0,
    lead_time_produktion: 20, lead_time_qi: 5, lead_time_verladung: 8,
    lead_time_import: 14, lead_time_verzollung: 4, lead_time_restocking: 3,
    // Lead Time gesamt: 54 Tage
    daily_usage_shop: 4.2, daily_usage_amazon: 2.8,  // ~7 Einh./Tag
    safety_stock: 60,
  },
  // 🔴 Überfällig — Bestand kritisch niedrig
  {
    name: 'Analoge Lernuhr aus Holz',
    sku: 'EDU-TIME-004',
    stock_shop: 12, stock_amazon: 5, stock_transit: 0, stock_production: 0,
    lead_time_produktion: 35, lead_time_qi: 10, lead_time_verladung: 12,
    lead_time_import: 21, lead_time_verzollung: 5, lead_time_restocking: 5,
    // Lead Time gesamt: 88 Tage
    daily_usage_shop: 2.5, daily_usage_amazon: 1.8,  // ~4.3 Einh./Tag
    safety_stock: 40,
  },
  // 🔴 Überfällig — Hochsaison-Artikel, zu wenig Puffer
  {
    name: 'Rechenhilfe Würfelset (10er-Pack)',
    sku: 'EDU-CALC-005',
    stock_shop: 30, stock_amazon: 8, stock_transit: 0, stock_production: 0,
    lead_time_produktion: 28, lead_time_qi: 6, lead_time_verladung: 9,
    lead_time_import: 16, lead_time_verzollung: 4, lead_time_restocking: 4,
    // Lead Time gesamt: 67 Tage
    daily_usage_shop: 6.0, daily_usage_amazon: 4.5,
    safety_stock: 80,
  },
  // ✅ Sicher — langsamer Dreher mit langem Lead Time
  {
    name: 'Lese-Lernspiel Silbentrennung',
    sku: 'EDU-READ-006',
    stock_shop: 210, stock_amazon: 140, stock_transit: 60, stock_production: 0,
    lead_time_produktion: 30, lead_time_qi: 8, lead_time_verladung: 10,
    lead_time_import: 18, lead_time_verzollung: 4, lead_time_restocking: 5,
    // Lead Time gesamt: 75 Tage
    daily_usage_shop: 2.0, daily_usage_amazon: 1.5,
    safety_stock: 50,
  },
  // ⚠️ Dringend — schnelldrehend, nur noch wenige Tage
  {
    name: 'Schreibübungsheft Klasse 1 (5er-Set)',
    sku: 'EDU-WRITE-007',
    stock_shop: 95, stock_amazon: 35, stock_transit: 0, stock_production: 0,
    lead_time_produktion: 15, lead_time_qi: 3, lead_time_verladung: 6,
    lead_time_import: 10, lead_time_verzollung: 2, lead_time_restocking: 2,
    // Lead Time gesamt: 38 Tage
    daily_usage_shop: 12.0, daily_usage_amazon: 8.5,
    safety_stock: 200,
  },
]

async function seed() {
  console.log('🌱  Befülle Produkttabelle …\n')

  const { data, error } = await supabase
    .from('products')
    .upsert(produkte, { onConflict: 'sku' })
    .select()

  if (error) {
    console.error('❌  Fehler beim Befüllen:', error.message)
    process.exit(1)
  }

  console.log(`✅  ${data?.length ?? 0} Produkte importiert:\n`)
  data?.forEach((p) => console.log(`   [${p.sku}]  ${p.name}`))
  console.log('\nFertig.')
}

seed()
