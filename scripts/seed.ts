/**
 * Seed-Skript — Echte Edubini-Produkte
 * Datenquelle: Stockplaner 2026 - Hiring Challenge.xlsx
 * Sheets: "Re Order Planner", "Kopie von v1"
 *
 * Verwendung: npm run seed
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import type { NewProduct } from '../types/product'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lead Time Aufschlüsselung:
// TAT 79: Prod=25, QI=5, Verl=14, Import=25, Verzoll=5, Restocking=5 = 79 Tage
// TAT 69: Prod=20, QI=4, Verl=14, Import=21, Verzoll=5, Restocking=5 = 69 Tage
const lt79 = { lead_time_produktion: 25, lead_time_qi: 5, lead_time_verladung: 14, lead_time_import: 25, lead_time_verzollung: 5, lead_time_restocking: 5 }
const lt69 = { lead_time_produktion: 20, lead_time_qi: 4, lead_time_verladung: 14, lead_time_import: 21, lead_time_verzollung: 5, lead_time_restocking: 5 }

const produkte: NewProduct[] = [
  // ── Affirmationskarten ──────────────────────────────────────────
  { name: 'Affirmationskarten für Kinder',              sku: 'AFFCARDSA7GER001',     stock_shop: 0,     stock_amazon: 0,    stock_transit: 0, stock_production: 27000, ...lt79, daily_usage_shop: 63.33, daily_usage_amazon: 25.00, safety_stock: 60 },
  { name: 'Affirmationskarten für Kinder (Fußball)',    sku: 'SOCCERCARDSA7GER001',  stock_shop: 0,     stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt79, daily_usage_shop: 30.00, daily_usage_amazon: 3.00,  safety_stock: 60 },
  { name: 'Affirmationskarten für Kinder (Prinzessin)', sku: 'PINKCARDSA7GER001',    stock_shop: 0,     stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt79, daily_usage_shop: 15.00, daily_usage_amazon: 0.70,  safety_stock: 60 },
  { name: 'Affirmationskarten für Kinder (Winter)',     sku: 'WINTERCARDSA7GER001',  stock_shop: 0,     stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt79, daily_usage_shop: 30.00, daily_usage_amazon: 0.33,  safety_stock: 60 },

  // ── Magische Übungshefte ────────────────────────────────────────
  { name: 'Magische Übungshefte 4er Set',        sku: 'HEFTSETB5GER002',   stock_shop: 3800, stock_amazon: 2000, stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 90.00, daily_usage_amazon: 50.00, safety_stock: 60 },
  { name: 'Magische Übungshefte 6er Set',        sku: 'HEFT6SETB5GER002',  stock_shop: 0,    stock_amazon: 480,  stock_transit: 0, stock_production: 18000, ...lt69, daily_usage_shop: 70.00, daily_usage_amazon: 45.00, safety_stock: 60 },
  { name: 'Magische Übungshefte Großbuchstaben', sku: 'HEFTBUCHB5GER002',  stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 5.00,  daily_usage_amazon: 10.00, safety_stock: 30 },
  { name: 'Magische Übungshefte Zahlen',         sku: 'HEFTZAHLB5GER002',  stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 5.00,  daily_usage_amazon: 5.00,  safety_stock: 30 },
  { name: 'Magische Übungshefte Zeichnen',       sku: 'HEFTZEICHB5GER002', stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 3.33,  daily_usage_amazon: 1.67,  safety_stock: 30 },
  { name: 'Magische Übungshefte Mathe',          sku: 'HEFTMATHB5GER002',  stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 2.00,  daily_usage_amazon: 1.67,  safety_stock: 30 },
  { name: 'Magische Übungshefte Kleinbuchstaben',sku: 'HEFTKLEINB5GER002', stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 2.00,  daily_usage_amazon: 1.67,  safety_stock: 30 },
  { name: 'Magische Übungshefte Schreibschrift', sku: 'HEFTSCHRB5GER002',  stock_shop: 0,    stock_amazon: 0,    stock_transit: 0, stock_production: 0,     ...lt69, daily_usage_shop: 5.00,  daily_usage_amazon: 1.67,  safety_stock: 30 },

  // ── Montessori Memo Spiel ───────────────────────────────────────
  { name: 'Montessori Memo Spiel', sku: 'MEMOSPIEL7X7GER003', stock_shop: 0, stock_amazon: 0, stock_transit: 0, stock_production: 0, ...lt79, daily_usage_shop: 4.00, daily_usage_amazon: 30.00, safety_stock: 60 },

  // ── Belohnungstafeln ────────────────────────────────────────────
  { name: 'Belohnungstafel Space',     sku: 'TAFELBLUEGER005',   stock_shop: 1491, stock_amazon: 1600, stock_transit: 0, stock_production: 12400, ...lt79, daily_usage_shop: 23.67, daily_usage_amazon: 35.00, safety_stock: 60 },
  { name: 'Belohnungstafel Dino',      sku: 'TAFELGREENGER005',  stock_shop: 3515, stock_amazon: 400,  stock_transit: 0, stock_production: 3600,  ...lt79, daily_usage_shop: 20.00, daily_usage_amazon: 23.33, safety_stock: 60 },
  { name: 'Belohnungstafel Prinzessin',sku: 'TAFELPINKGER005',   stock_shop: 144,  stock_amazon: 900,  stock_transit: 0, stock_production: 3200,  ...lt79, daily_usage_shop: 15.00, daily_usage_amazon: 20.00, safety_stock: 60 },

  // ── Suchspiel ───────────────────────────────────────────────────
  { name: 'Gefunden! Outdoor Suchspiel', sku: 'SUCHCARDSA7006', stock_shop: 48000, stock_amazon: 5000, stock_transit: 0, stock_production: 0, ...lt79, daily_usage_shop: 150.00, daily_usage_amazon: 50.00, safety_stock: 60 },

  // ── Gefühlstagebücher ───────────────────────────────────────────
  { name: 'Gefühlstagebuch für Kinder (Orange)', sku: 'TAGEBUCHORA5GER009', stock_shop: 345,  stock_amazon: 992, stock_transit: 0, stock_production: 9500,  ...lt79, daily_usage_shop: 20.00, daily_usage_amazon: 33.00, safety_stock: 60 },
  { name: 'Gefühlstagebuch für Kinder (Blau)',   sku: 'TAGEBUCHBLA5GER009', stock_shop: 929,  stock_amazon: 900, stock_transit: 0, stock_production: 12000, ...lt79, daily_usage_shop: 50.00, daily_usage_amazon: 35.00, safety_stock: 60 },
  { name: 'Gefühlstagebuch für Kinder (Rot)',    sku: 'TAGEBUCHROA5GER009', stock_shop: 1714, stock_amazon: 400, stock_transit: 0, stock_production: 1000,  ...lt79, daily_usage_shop: 15.00, daily_usage_amazon: 10.00, safety_stock: 60 },
  { name: 'Gefühlstagebuch für Kinder (Grün)',   sku: 'TAGEBUCHGRA5GER009', stock_shop: 140,  stock_amazon: 100, stock_transit: 0, stock_production: 3500,  ...lt79, daily_usage_shop: 25.00, daily_usage_amazon: 21.67, safety_stock: 60 },

  // ── Gefühlskarten ───────────────────────────────────────────────
  { name: 'Gefühlskarten für Kinder', sku: 'FEELCARDSA7GER009', stock_shop: 770, stock_amazon: 680, stock_transit: 0, stock_production: 30240, ...lt79, daily_usage_shop: 150.00, daily_usage_amazon: 63.33, safety_stock: 60 },

  // ── Gewichtskuscheltier ─────────────────────────────────────────
  { name: 'Gewichtskuscheltier', sku: 'TOYBEARGER008', stock_shop: 0, stock_amazon: 0, stock_transit: 0, stock_production: 0, ...lt79, daily_usage_shop: 10.00, daily_usage_amazon: 10.00, safety_stock: 30 },
]

async function seed() {
  console.log('🌱  Befülle Produkttabelle mit echten Edubini-Produkten …\n')

  const { data, error } = await supabase
    .from('products')
    .upsert(produkte, { onConflict: 'sku' })
    .select()

  if (error) {
    console.error('❌  Fehler:', error.message)
    process.exit(1)
  }

  console.log(`✅  ${data?.length ?? 0} Produkte importiert:\n`)
  data?.forEach((p) => console.log(`   [${p.sku}]  ${p.name}`))
  console.log('\nFertig.')
}

seed()
