-- Run in Supabase: SQL Editor -> New query -> paste -> Run
--
-- Already ran an earlier version? Uncomment this block first (it DELETES all data):
-- drop table if exists certificates, master_calibrators, standard_calibrators, products, customers cascade;

create table customers (
  id          bigint generated always as identity primary key,
  name        text not null,
  address     text,
  phone       text,
  gstin       text,
  dealer      text,                        -- IOCL, BPCL, HPCL, Apollo...
  created_at  timestamptz not null default now()
);

create table products (
  item_id           bigint generated always as identity primary key,
  item_description  text not null,         -- Nitrogen Inflator, Airojet...
  item_model        text,
  item_range        text,
  id_no             text,
  item_image_url    text
);

create table master_calibrators (
  id                  bigint generated always as identity primary key,
  name                text not null,       -- e.g. DIGITAL PRESSURE GAUGE
  make                text,
  model               text,
  serial_number       text,
  certificate_number  text,
  created_at          timestamptz not null default now()
);

create table standard_calibrators (
  id                  bigint generated always as identity primary key,
  name                text not null,       -- e.g. DIGITAL MASTER PRESSURE GAUGE
  make                text,
  id_sl_no            text,                -- ID. No. & SL. NO.
  reference_standard  text,
  certificate_number  text,
  created_at          timestamptz not null default now()
);

create table certificates (
  id                      bigint generated always as identity primary key,
  cert_no                 text,            -- numbering scheme TBD (client to explain)
  customer_id             bigint references customers(id),
  item_id                 bigint references products(item_id),
  master_calibrator_id    bigint references master_calibrators(id),
  standard_calibrator_id  bigint references standard_calibrators(id),
  env_condition           text,
  cal_date                date,
  next_cal_date           date,
  result_text             text,
  done_by                 text,
  reminder_acknowledged   boolean not null default false,
  created_at              timestamptz not null default now(),
  is_verified             boolean not null default false,
  confirmed_by            text,
  verified_at             timestamptz
);

create index on certificates (is_verified, created_at desc);
create index on certificates (customer_id);
create index on certificates (item_id);
create index on certificates (master_calibrator_id);
create index on certificates (standard_calibrator_id);

-- Row Level Security: only logged-in users can read/write
alter table customers            enable row level security;
alter table products             enable row level security;
alter table master_calibrators   enable row level security;
alter table standard_calibrators enable row level security;
alter table certificates         enable row level security;

create policy "auth all" on customers            for all to authenticated using (true) with check (true);
create policy "auth all" on products             for all to authenticated using (true) with check (true);
create policy "auth all" on master_calibrators   for all to authenticated using (true) with check (true);
create policy "auth all" on standard_calibrators for all to authenticated using (true) with check (true);
create policy "auth all" on certificates         for all to authenticated using (true) with check (true);
