create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  servicio text not null check (servicio in ('sala', 'taller', 'entrada', 'otro')),
  detalle text check (detalle is null or char_length(btrim(detalle)) <= 120),
  fecha date not null,
  nombre text not null check (char_length(btrim(nombre)) between 2 and 120),
  whatsapp text not null check (char_length(btrim(whatsapp)) between 6 and 30),
  email text check (email is null or char_length(btrim(email)) between 3 and 254),
  mensaje text check (mensaje is null or char_length(btrim(mensaje)) <= 2000),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'contactada', 'confirmada', 'cancelada')),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create index reservas_fecha_idx on public.reservas (fecha desc);
create index reservas_estado_idx on public.reservas (estado);

alter table public.reservas enable row level security;

revoke all on table public.reservas from anon, authenticated;
