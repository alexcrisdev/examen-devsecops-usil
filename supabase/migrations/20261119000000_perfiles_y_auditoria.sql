-- Base de seguridad: perfiles con rol + bitácora de auditoría, con RLS.
-- AJUSTAR la lista de roles al caso ANTES del primer `supabase db push`
-- (debe coincidir con src/lib/roles.ts).

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120),
  rol text not null default 'usuario' check (rol in ('admin', 'usuario')),
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- El proyecto NO da acceso automático a tablas nuevas: se otorga lo mínimo.
-- anon (sin login) no recibe nada. RLS filtra las filas dentro de estos permisos.
revoke all on public.perfiles from anon, authenticated;
grant select, update (nombre, rol) on public.perfiles to authenticated;

-- Función auxiliar: rol del usuario actual. security definer evita recursión en RLS.
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.perfiles where id = (select auth.uid());
$$;

revoke all on function public.rol_actual() from public, anon;
grant execute on function public.rol_actual() to authenticated;

create policy "perfil propio o admin puede leer"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or public.rol_actual() = 'admin');

create policy "solo admin cambia perfiles"
  on public.perfiles for update to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- Al registrarse un usuario se crea su perfil con el rol más bajo.
-- El rol NUNCA se toma de lo que envía el navegador (evita escalar privilegios).
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

revoke all on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Bitácora de auditoría (OWASP A09). Solo se escribe desde funciones/servidor.
create table public.auditoria (
  id bigint generated always as identity primary key,
  usuario_id uuid references auth.users (id) on delete set null,
  accion text not null,
  entidad text not null,
  entidad_id text,
  detalle jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

alter table public.auditoria enable row level security;

revoke all on public.auditoria from anon, authenticated;
grant select, insert on public.auditoria to authenticated;

create policy "solo admin lee la auditoría"
  on public.auditoria for select to authenticated
  using (public.rol_actual() = 'admin');

create policy "usuario registra sus propias acciones"
  on public.auditoria for insert to authenticated
  with check (usuario_id = (select auth.uid()));
