-- ============================================================
-- Stockplaner — Tabelle erstellen + Beispieldaten einfügen
-- Alles in einem Schritt im Supabase SQL Editor ausführen
-- ============================================================

-- Sauber neu erstellen
drop table if exists products cascade;

create table products (
  id               uuid            primary key default gen_random_uuid(),
  name             text            not null,
  sku              text            not null unique,
  stock_shop       integer         not null default 0,
  stock_amazon     integer         not null default 0,
  stock_transit    integer         not null default 0,
  stock_production integer         not null default 0,
  lead_time_produktion  integer    not null default 0,
  lead_time_qi          integer    not null default 0,
  lead_time_verladung   integer    not null default 0,
  lead_time_import      integer    not null default 0,
  lead_time_verzollung  integer    not null default 0,
  lead_time_restocking  integer    not null default 0,
  daily_usage_shop      numeric(10,2) not null default 0,
  daily_usage_amazon    numeric(10,2) not null default 0,
  safety_stock          integer    not null default 0,
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now()
);

-- Auto-Update für updated_at
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

-- Row Level Security
alter table products enable row level security;
create policy "anon_select" on products for select to anon        using (true);
create policy "auth_all"    on products for all    to authenticated using (true) with check (true);

-- ============================================================
-- Beispielprodukte — Edubini Lernmaterialien
-- ============================================================
insert into products (
  name, sku,
  stock_shop, stock_amazon, stock_transit, stock_production,
  lead_time_produktion, lead_time_qi, lead_time_verladung,
  lead_time_import, lead_time_verzollung, lead_time_restocking,
  daily_usage_shop, daily_usage_amazon,
  safety_stock
) values
  -- Sicher
  (
    'Lernkarten Mathe Klasse 1–2', 'EDU-MATH-001',
    320, 210, 120, 0,
    25, 5, 7, 14, 3, 4,
    8.5, 6.2,
    150
  ),
  -- Sicher (Bestand in Produktion)
  (
    'ABC-Lernspielpuzzle Vorschule', 'EDU-READ-002',
    180, 95, 0, 400,
    30, 7, 10, 18, 5, 5,
    5.0, 3.8,
    100
  ),
  -- Dringend
  (
    'Englisch Vokabel-Flashcards A1', 'EDU-ENG-003',
    45, 18, 0, 0,
    20, 5, 8, 14, 4, 3,
    4.2, 2.8,
    60
  ),
  -- Überfällig
  (
    'Analoge Lernuhr aus Holz', 'EDU-TIME-004',
    12, 5, 0, 0,
    35, 10, 12, 21, 5, 5,
    2.5, 1.8,
    40
  ),
  -- Überfällig (Hochsaison)
  (
    'Rechenhilfe Würfelset (10er-Pack)', 'EDU-CALC-005',
    30, 8, 0, 0,
    28, 6, 9, 16, 4, 4,
    6.0, 4.5,
    80
  ),
  -- Sicher (langsamer Dreher)
  (
    'Lese-Lernspiel Silbentrennung', 'EDU-READ-006',
    210, 140, 60, 0,
    30, 8, 10, 18, 4, 5,
    2.0, 1.5,
    50
  ),
  -- Dringend (schnelldrehend)
  (
    'Schreibuebungsheft Klasse 1 (5er-Set)', 'EDU-WRITE-007',
    95, 35, 0, 0,
    15, 3, 6, 10, 2, 2,
    12.0, 8.5,
    200
  );

-- Ergebnis anzeigen
select name, sku, (stock_shop + stock_amazon + stock_transit + stock_production) as lagerbestand_gesamt
from products
order by name;
