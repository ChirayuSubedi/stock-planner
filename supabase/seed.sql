-- ============================================================
-- Stockplaner — Tabelle erstellen + Echte Edubini-Produkte
-- Datenquelle: Stockplaner 2026 - Hiring Challenge.xlsx
-- Sheets: "Re Order Planner", "Kopie von v1", "Planung Tagebücher"
-- ============================================================

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

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

alter table products enable row level security;
create policy "anon_select" on products for select to anon        using (true);
create policy "auth_all"    on products for all    to authenticated using (true) with check (true);

-- ============================================================
-- Echte Edubini-Produkte
-- Lead Time Aufschlüsselung (TAT 79): Prod=25, QI=5, Verl=14, Import=25, Verzoll=5, Restocking=5
-- Lead Time Aufschlüsselung (TAT 69): Prod=20, QI=4, Verl=14, Import=21, Verzoll=5, Restocking=5
-- Quelle Lagerbestand: Re Order Planner Sheet
-- Quelle Daily Usage: Kopie von v1 Sheet
-- ============================================================
insert into products (
  name, sku,
  stock_shop, stock_amazon, stock_transit, stock_production,
  lead_time_produktion, lead_time_qi, lead_time_verladung,
  lead_time_import, lead_time_verzollung, lead_time_restocking,
  daily_usage_shop, daily_usage_amazon,
  safety_stock
) values
  -- ── Affirmationskarten ──────────────────────────────────────────
  (
    'Affirmationskarten für Kinder',
    'AFFCARDSA7GER001',
    0, 0, 0, 27000,
    25, 5, 14, 25, 5, 5,   -- TAT 79
    63.33, 25.00,
    60
  ),
  (
    'Affirmationskarten für Kinder (Fußball)',
    'SOCCERCARDSA7GER001',
    0, 0, 0, 0,
    25, 5, 14, 25, 5, 5,
    30.00, 3.00,
    60
  ),
  (
    'Affirmationskarten für Kinder (Prinzessin)',
    'PINKCARDSA7GER001',
    0, 0, 0, 0,
    25, 5, 14, 25, 5, 5,
    15.00, 0.70,
    60
  ),
  (
    'Affirmationskarten für Kinder (Winter)',
    'WINTERCARDSA7GER001',
    0, 0, 0, 0,
    25, 5, 14, 25, 5, 5,
    30.00, 0.33,
    60
  ),

  -- ── Magische Übungshefte ────────────────────────────────────────
  (
    'Magische Übungshefte 4er Set',
    'HEFTSETB5GER002',
    3800, 2000, 0, 0,       -- Re Order Planner: Übungsheft 4er
    20, 4, 14, 21, 5, 5,   -- TAT 69
    90.00, 50.00,
    60
  ),
  (
    'Magische Übungshefte 6er Set',
    'HEFT6SETB5GER002',
    0, 480, 0, 18000,       -- Re Order Planner: Übungsheft 6er
    20, 4, 14, 21, 5, 5,
    70.00, 45.00,
    60
  ),
  (
    'Magische Übungshefte Großbuchstaben',
    'HEFTBUCHB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    5.00, 10.00,
    30
  ),
  (
    'Magische Übungshefte Zahlen',
    'HEFTZAHLB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    5.00, 5.00,
    30
  ),
  (
    'Magische Übungshefte Zeichnen',
    'HEFTZEICHB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    3.33, 1.67,
    30
  ),
  (
    'Magische Übungshefte Mathe',
    'HEFTMATHB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    2.00, 1.67,
    30
  ),
  (
    'Magische Übungshefte Kleinbuchstaben',
    'HEFTKLEINB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    2.00, 1.67,
    30
  ),
  (
    'Magische Übungshefte Schreibschrift',
    'HEFTSCHRB5GER002',
    0, 0, 0, 0,
    20, 4, 14, 21, 5, 5,
    5.00, 1.67,
    30
  ),

  -- ── Montessori Memo Spiel ───────────────────────────────────────
  (
    'Montessori Memo Spiel',
    'MEMOSPIEL7X7GER003',
    0, 0, 0, 0,
    25, 5, 14, 25, 5, 5,
    4.00, 30.00,
    60
  ),

  -- ── Belohnungstafeln ────────────────────────────────────────────
  (
    'Belohnungstafel Space',
    'TAFELBLUEGER005',
    1491, 1600, 0, 12400,   -- Re Order Planner: Tafel Blau
    25, 5, 14, 25, 5, 5,
    23.67, 35.00,
    60
  ),
  (
    'Belohnungstafel Dino',
    'TAFELGREENGER005',
    3515, 400, 0, 3600,     -- Re Order Planner: Tafel Grün
    25, 5, 14, 25, 5, 5,
    20.00, 23.33,
    60
  ),
  (
    'Belohnungstafel Prinzessin',
    'TAFELPINKGER005',
    144, 900, 0, 3200,      -- Re Order Planner: Tafel Pink
    25, 5, 14, 25, 5, 5,
    15.00, 20.00,
    60
  ),

  -- ── Suchspiel ───────────────────────────────────────────────────
  (
    'Gefunden! Outdoor Suchspiel',
    'SUCHCARDSA7006',
    48000, 5000, 0, 0,      -- Re Order Planner: Suchspiel
    25, 5, 14, 25, 5, 5,
    150.00, 50.00,
    60
  ),

  -- ── Gefühlstagebücher ───────────────────────────────────────────
  (
    'Gefühlstagebuch für Kinder (Orange)',
    'TAGEBUCHORA5GER009',
    345, 992, 0, 9500,      -- Re Order Planner: Tagebuch Orange
    25, 5, 14, 25, 5, 5,
    20.00, 33.00,
    60
  ),
  (
    'Gefühlstagebuch für Kinder (Blau)',
    'TAGEBUCHBLA5GER009',
    929, 900, 0, 12000,     -- Re Order Planner: Tagebuch Blau
    25, 5, 14, 25, 5, 5,
    50.00, 35.00,
    60
  ),
  (
    'Gefühlstagebuch für Kinder (Rot)',
    'TAGEBUCHROA5GER009',
    1714, 400, 0, 1000,     -- Re Order Planner: Tagebuch Rot
    25, 5, 14, 25, 5, 5,
    15.00, 10.00,
    60
  ),
  (
    'Gefühlstagebuch für Kinder (Grün)',
    'TAGEBUCHGRA5GER009',
    140, 100, 0, 3500,      -- Re Order Planner: Tagebuch Grün
    25, 5, 14, 25, 5, 5,
    25.00, 21.67,
    60
  ),

  -- ── Gefühlskarten ───────────────────────────────────────────────
  (
    'Gefühlskarten für Kinder',
    'FEELCARDSA7GER009',
    770, 680, 0, 30240,     -- Re Order Planner: Gefühlskarten
    25, 5, 14, 25, 5, 5,
    150.00, 63.33,
    60
  ),

  -- ── Gewichtskuscheltier ─────────────────────────────────────────
  (
    'Gewichtskuscheltier',
    'TOYBEARGER008',
    0, 0, 0, 0,
    25, 5, 14, 25, 5, 5,
    10.00, 10.00,
    30
  );

-- Ergebnis anzeigen
select name, sku,
  (stock_shop + stock_amazon + stock_transit + stock_production) as lager_gesamt,
  (daily_usage_shop + daily_usage_amazon) as verbrauch_pro_tag,
  (lead_time_produktion + lead_time_qi + lead_time_verladung + lead_time_import + lead_time_verzollung + lead_time_restocking) as lead_time_gesamt
from products
order by name;
