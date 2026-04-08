/**
 * Setup-Skript — erstellt die products-Tabelle und befüllt sie mit Beispieldaten.
 * Nutzt die Supabase Management API (pg-meta) um SQL direkt auszuführen.
 *
 * Verwendung:  npx tsx scripts/setup-db.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen in .env.local gesetzt sein.')
  process.exit(1)
}

const SQL = `
-- Tabelle komplett neu erstellen
drop table if exists products cascade;

create table products (
  id               uuid            primary key default gen_random_uuid(),
  name             text            not null,
  sku              text            not null unique,
  stock_shop       integer         not null default 0 check (stock_shop >= 0),
  stock_amazon     integer         not null default 0 check (stock_amazon >= 0),
  stock_transit    integer         not null default 0 check (stock_transit >= 0),
  stock_production integer         not null default 0 check (stock_production >= 0),
  lead_time_produktion  integer    not null default 0 check (lead_time_produktion >= 0),
  lead_time_qi          integer    not null default 0 check (lead_time_qi >= 0),
  lead_time_verladung   integer    not null default 0 check (lead_time_verladung >= 0),
  lead_time_import      integer    not null default 0 check (lead_time_import >= 0),
  lead_time_verzollung  integer    not null default 0 check (lead_time_verzollung >= 0),
  lead_time_restocking  integer    not null default 0 check (lead_time_restocking >= 0),
  daily_usage_shop      numeric(10,2) not null default 0 check (daily_usage_shop >= 0),
  daily_usage_amazon    numeric(10,2) not null default 0 check (daily_usage_amazon >= 0),
  safety_stock          integer    not null default 0 check (safety_stock >= 0),
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now()
);

create index idx_products_sku  on products (sku);
create index idx_products_name on products (name);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

alter table products enable row level security;
create policy "anon_select" on products for select to anon        using (true);
create policy "auth_all"    on products for all    to authenticated using (true) with check (true);

-- Beispieldaten einfügen
insert into products (
  name, sku,
  stock_shop, stock_amazon, stock_transit, stock_production,
  lead_time_produktion, lead_time_qi, lead_time_verladung,
  lead_time_import, lead_time_verzollung, lead_time_restocking,
  daily_usage_shop, daily_usage_amazon,
  safety_stock
) values
  ('Lernkarten Mathe Klasse 1-2', 'EDU-MATH-001',
    320, 210, 120, 0, 25, 5, 7, 14, 3, 4, 8.5, 6.2, 150),
  ('ABC-Lernspielpuzzle Vorschule', 'EDU-READ-002',
    180, 95, 0, 400, 30, 7, 10, 18, 5, 5, 5.0, 3.8, 100),
  ('Englisch Vokabel-Flashcards A1', 'EDU-ENG-003',
    45, 18, 0, 0, 20, 5, 8, 14, 4, 3, 4.2, 2.8, 60),
  ('Analoge Lernuhr aus Holz', 'EDU-TIME-004',
    12, 5, 0, 0, 35, 10, 12, 21, 5, 5, 2.5, 1.8, 40),
  ('Rechenhilfe Wuerfelset (10er-Pack)', 'EDU-CALC-005',
    30, 8, 0, 0, 28, 6, 9, 16, 4, 4, 6.0, 4.5, 80),
  ('Lese-Lernspiel Silbentrennung', 'EDU-READ-006',
    210, 140, 60, 0, 30, 8, 10, 18, 4, 5, 2.0, 1.5, 50),
  ('Schreibuebungsheft Klasse 1 (5er-Set)', 'EDU-WRITE-007',
    95, 35, 0, 0, 15, 3, 6, 10, 2, 2, 12.0, 8.5, 200);
`

async function setup() {
  console.log('🔧  Erstelle products-Tabelle und füge Beispieldaten ein...\n')

  // Use Supabase's pg-meta SQL endpoint (available with service_role key)
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: SQL }),
  })

  if (!res.ok) {
    // Try alternative endpoint
    console.log('⏳  Versuche alternative Methode...\n')

    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: SQL }),
    })

    if (!res2.ok) {
      console.error('❌  Konnte SQL nicht über die API ausführen.')
      console.error('    Bitte führe die SQL-Datei manuell im Supabase SQL Editor aus:')
      console.error('    https://supabase.com/dashboard/project/bnnwqwmvenjdlbtvacsf/sql/new')
      console.error('')
      console.error('    Kopiere den Inhalt von supabase/seed.sql und klicke "Run".')
      process.exit(1)
    }
  }

  const result = await res.json()
  console.log('✅  Tabelle erstellt und Daten eingefügt!')
  console.log(result)
}

setup().catch((err) => {
  console.error('❌  Fehler:', err.message)
  process.exit(1)
})
