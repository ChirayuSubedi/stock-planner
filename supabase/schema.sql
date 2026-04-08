-- ============================================================
-- Stockplaner — Schema (sicheres Reset + Neuerstellen)
-- Einfach ausführen, auch wenn die Tabelle bereits existiert
-- ============================================================

-- Tabelle komplett neu erstellen (löscht vorhandene Daten!)
drop table if exists products cascade;

create table products (
  id               uuid            primary key default gen_random_uuid(),
  name             text            not null,
  sku              text            not null unique,

  -- Lagerbestände
  stock_shop       integer         not null default 0 check (stock_shop >= 0),
  stock_amazon     integer         not null default 0 check (stock_amazon >= 0),
  stock_transit    integer         not null default 0 check (stock_transit >= 0),
  stock_production integer         not null default 0 check (stock_production >= 0),

  -- Vorlaufzeit aufgeschlüsselt (in Tagen)
  lead_time_produktion  integer    not null default 0 check (lead_time_produktion >= 0),
  lead_time_qi          integer    not null default 0 check (lead_time_qi >= 0),
  lead_time_verladung   integer    not null default 0 check (lead_time_verladung >= 0),
  lead_time_import      integer    not null default 0 check (lead_time_import >= 0),
  lead_time_verzollung  integer    not null default 0 check (lead_time_verzollung >= 0),
  lead_time_restocking  integer    not null default 0 check (lead_time_restocking >= 0),

  -- Tagesverbrauch pro Kanal
  daily_usage_shop      numeric(10,2) not null default 0 check (daily_usage_shop >= 0),
  daily_usage_amazon    numeric(10,2) not null default 0 check (daily_usage_amazon >= 0),

  -- Sicherheitsbestand
  safety_stock          integer    not null default 0 check (safety_stock >= 0),

  -- Audit
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now()
);

-- Indizes für schnelle Suche
create index idx_products_sku  on products (sku);
create index idx_products_name on products (name);

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

create policy "anon_select"  on products for select to anon        using (true);
create policy "auth_all"     on products for all    to authenticated using (true) with check (true);
