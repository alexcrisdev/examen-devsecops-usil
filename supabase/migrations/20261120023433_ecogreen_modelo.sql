-- EcoGreen: modelo de datos (3FN) con RLS por rol.
-- Roles: generador (hogar/negocio), recolector, admin_acopio, admin.
-- Debe coincidir con src/lib/roles.ts.

-- =====================================================================
-- 1. Perfiles: nuevos roles y datos del caso
-- =====================================================================
-- Primero se quita la regla vieja (admin/usuario) y luego se migran los datos.
alter table public.perfiles drop constraint if exists perfiles_rol_check;
update public.perfiles set rol = 'generador' where rol not in ('generador', 'recolector', 'admin_acopio', 'admin');
alter table public.perfiles
  add constraint perfiles_rol_check check (rol in ('generador', 'recolector', 'admin_acopio', 'admin'));
alter table public.perfiles alter column rol set default 'generador';

alter table public.perfiles
  add column tipo_generador text check (tipo_generador in ('hogar', 'negocio')),
  add column distrito text check (char_length(distrito) <= 80),
  add column verificado boolean not null default false;

-- Solo el admin cambia rol/verificación (la política "solo admin cambia perfiles" ya existe).
grant update (verificado) on public.perfiles to authenticated;

create index perfiles_rol_verificado_idx on public.perfiles (rol, verificado);

-- El rol del registro solo puede ser generador o recolector. Cualquier otro valor
-- enviado por el navegador (ej. "admin") se ignora: nunca se escalan privilegios.
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rol text := case when new.raw_user_meta_data ->> 'rol' = 'recolector' then 'recolector' else 'generador' end;
begin
  insert into public.perfiles (id, nombre, rol, tipo_generador, distrito)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)), 120),
    v_rol,
    case when v_rol = 'generador' then
      case when new.raw_user_meta_data ->> 'tipo_generador' = 'negocio' then 'negocio' else 'hogar' end
    end,
    left(nullif(trim(new.raw_user_meta_data ->> 'distrito'), ''), 80)
  );
  return new;
end;
$$;

revoke all on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

-- ¿El usuario actual es un recolector verificado? (security definer: evita recursión en RLS)
create or replace function public.recolector_verificado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'recolector' and verificado
  );
$$;

revoke all on function public.recolector_verificado() from public, anon;
grant execute on function public.recolector_verificado() to authenticated;

-- =====================================================================
-- 2. Catálogo de materiales (lectura pública: no es dato personal)
-- =====================================================================
create table public.materiales (
  codigo text primary key check (codigo ~ '^[a-z_]{2,30}$'),
  nombre text not null check (char_length(nombre) between 2 and 60)
);

alter table public.materiales enable row level security;
revoke all on public.materiales from anon, authenticated;
grant select on public.materiales to anon, authenticated;

create policy "catálogo de materiales es público"
  on public.materiales for select to anon, authenticated
  using (true);

insert into public.materiales (codigo, nombre) values
  ('papel', 'Papel'),
  ('carton', 'Cartón'),
  ('plastico', 'Plástico'),
  ('vidrio', 'Vidrio'),
  ('metal', 'Metal'),
  ('electronicos', 'Aparatos electrónicos (RAEE)');

-- =====================================================================
-- 3. Puntos de acopio (directorio público de los puntos activos)
-- =====================================================================
create table public.puntos_acopio (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.perfiles (id) on delete set null,
  nombre text not null check (char_length(nombre) between 3 and 120),
  direccion text not null check (char_length(direccion) between 5 and 200),
  distrito text not null check (char_length(distrito) between 2 and 80),
  referencia text check (char_length(referencia) <= 200),
  dias_atencion text not null check (char_length(dias_atencion) between 3 and 60),
  hora_apertura time not null,
  hora_cierre time not null,
  telefono_publico text check (telefono_publico ~ '^[0-9+ ]{6,20}$'),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint puntos_horario_valido check (hora_cierre > hora_apertura)
);

create index puntos_acopio_admin_idx on public.puntos_acopio (admin_id);
create index puntos_acopio_distrito_idx on public.puntos_acopio (distrito) where activo;

alter table public.puntos_acopio enable row level security;
revoke all on public.puntos_acopio from anon, authenticated;
-- Lectura pública justificada: el caso pide que cualquiera sepa dónde entregar.
grant select on public.puntos_acopio to anon, authenticated;
grant insert, update on public.puntos_acopio to authenticated;
grant delete on public.puntos_acopio to authenticated;

create policy "puntos activos son públicos"
  on public.puntos_acopio for select to anon, authenticated
  using (activo or admin_id = (select auth.uid()) or public.rol_actual() = 'admin');

create policy "admin de acopio crea su punto"
  on public.puntos_acopio for insert to authenticated
  with check (
    (public.rol_actual() = 'admin_acopio' and admin_id = (select auth.uid()))
    or public.rol_actual() = 'admin'
  );

create policy "admin de acopio edita solo su punto"
  on public.puntos_acopio for update to authenticated
  using ((public.rol_actual() = 'admin_acopio' and admin_id = (select auth.uid())) or public.rol_actual() = 'admin')
  with check ((public.rol_actual() = 'admin_acopio' and admin_id = (select auth.uid())) or public.rol_actual() = 'admin');

create policy "solo admin elimina puntos"
  on public.puntos_acopio for delete to authenticated
  using (public.rol_actual() = 'admin');

-- Materiales que recibe cada punto (N:M → 3FN)
create table public.punto_materiales (
  punto_id uuid not null references public.puntos_acopio (id) on delete cascade,
  material_codigo text not null references public.materiales (codigo) on delete restrict,
  primary key (punto_id, material_codigo)
);

create index punto_materiales_material_idx on public.punto_materiales (material_codigo);

alter table public.punto_materiales enable row level security;
revoke all on public.punto_materiales from anon, authenticated;
grant select on public.punto_materiales to anon, authenticated;
grant insert, delete on public.punto_materiales to authenticated;

create policy "materiales de puntos visibles"
  on public.punto_materiales for select to anon, authenticated
  using (exists (select 1 from public.puntos_acopio p where p.id = punto_id));

create policy "dueño del punto gestiona sus materiales (insert)"
  on public.punto_materiales for insert to authenticated
  with check (exists (
    select 1 from public.puntos_acopio p
    where p.id = punto_id
      and ((public.rol_actual() = 'admin_acopio' and p.admin_id = (select auth.uid())) or public.rol_actual() = 'admin')
  ));

create policy "dueño del punto gestiona sus materiales (delete)"
  on public.punto_materiales for delete to authenticated
  using (exists (
    select 1 from public.puntos_acopio p
    where p.id = punto_id
      and ((public.rol_actual() = 'admin_acopio' and p.admin_id = (select auth.uid())) or public.rol_actual() = 'admin')
  ));

-- =====================================================================
-- 4. Publicaciones de material (sin datos personales exactos)
-- =====================================================================
create table public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  generador_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  material_codigo text not null references public.materiales (codigo) on delete restrict,
  cantidad_kg numeric(10, 2) not null check (cantidad_kg > 0 and cantidad_kg <= 10000),
  distrito text not null check (char_length(distrito) between 2 and 80),
  referencia text check (char_length(referencia) <= 200),
  fecha_disponible date not null default current_date,
  franja_inicio time not null,
  franja_fin time not null,
  estado text not null default 'disponible'
    check (estado in ('disponible', 'reservado', 'recogido', 'cancelada')),
  recolector_id uuid references public.perfiles (id) on delete set null,
  reservado_en timestamptz,
  recogido_en timestamptz,
  creado_en timestamptz not null default now(),
  constraint publicaciones_franja_valida check (franja_fin > franja_inicio),
  constraint publicaciones_recolector_coherente check (
    (estado in ('disponible', 'cancelada') and recolector_id is null)
    or (estado = 'reservado' and recolector_id is not null)
    or estado = 'recogido'
  )
);

create index publicaciones_generador_idx on public.publicaciones (generador_id);
create index publicaciones_recolector_idx on public.publicaciones (recolector_id);
create index publicaciones_disponibles_idx on public.publicaciones (distrito, material_codigo) where estado = 'disponible';

alter table public.publicaciones enable row level security;
revoke all on public.publicaciones from anon, authenticated;
-- Sin UPDATE directo: los cambios de estado van por funciones (máquina de estados en BD).
grant select, insert on public.publicaciones to authenticated;

create policy "ver publicaciones según rol"
  on public.publicaciones for select to authenticated
  using (
    generador_id = (select auth.uid())
    or recolector_id = (select auth.uid())
    or (estado = 'disponible' and public.recolector_verificado())
    or public.rol_actual() = 'admin'
  );

create policy "generador publica a su nombre y disponible"
  on public.publicaciones for insert to authenticated
  with check (
    public.rol_actual() = 'generador'
    and generador_id = (select auth.uid())
    and estado = 'disponible'
    and recolector_id is null
  );

-- Datos de contacto exactos (Ley 29733): solo dueño, recolector asignado o admin.
create table public.publicacion_contactos (
  publicacion_id uuid primary key references public.publicaciones (id) on delete cascade,
  direccion text not null check (char_length(direccion) between 5 and 200),
  telefono text check (telefono ~ '^[0-9+ ]{6,20}$')
);

alter table public.publicacion_contactos enable row level security;
revoke all on public.publicacion_contactos from anon, authenticated;
grant select, insert on public.publicacion_contactos to authenticated;

create policy "contacto solo para dueño, recolector asignado o admin"
  on public.publicacion_contactos for select to authenticated
  using (exists (
    select 1 from public.publicaciones p
    where p.id = publicacion_id
      and (
        p.generador_id = (select auth.uid())
        or (p.recolector_id = (select auth.uid()) and p.estado in ('reservado', 'recogido'))
        or public.rol_actual() = 'admin'
      )
  ));

create policy "dueño registra el contacto de su publicación"
  on public.publicacion_contactos for insert to authenticated
  with check (exists (
    select 1 from public.publicaciones p
    where p.id = publicacion_id and p.generador_id = (select auth.uid())
  ));

-- Participantes de una publicación pueden verse el perfil (nombre) entre sí.
create policy "participantes de una publicación se ven"
  on public.perfiles for select to authenticated
  using (exists (
    select 1 from public.publicaciones p
    where (p.generador_id = (select auth.uid()) and p.recolector_id = perfiles.id)
       or (p.recolector_id = (select auth.uid()) and p.generador_id = perfiles.id)
  ));

-- ---------------------------------------------------------------------
-- Máquina de estados: disponible → reservado → recogido
--                     reservado → disponible (liberar)
--                     disponible → cancelada (generador)
-- Cada función valida rol, hace un UPDATE condicional (evita doble reserva)
-- y registra la acción en auditoría.
-- ---------------------------------------------------------------------
create or replace function public.reservar_publicacion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.recolector_verificado() then
    insert into public.auditoria (usuario_id, accion, entidad, entidad_id)
    values (auth.uid(), 'reserva_denegada', 'publicaciones', p_id::text);
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  update public.publicaciones
     set estado = 'reservado', recolector_id = auth.uid(), reservado_en = now()
   where id = p_id and estado = 'disponible'
  returning id into v_id;

  if v_id is null then
    raise exception 'no disponible' using errcode = 'P0002';
  end if;

  insert into public.auditoria (usuario_id, accion, entidad, entidad_id)
  values (auth.uid(), 'reservar', 'publicaciones', p_id::text);
end;
$$;

create or replace function public.liberar_publicacion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.publicaciones
     set estado = 'disponible', recolector_id = null, reservado_en = null
   where id = p_id and estado = 'reservado' and recolector_id = auth.uid()
  returning id into v_id;

  if v_id is null then
    raise exception 'no permitido' using errcode = '42501';
  end if;

  insert into public.auditoria (usuario_id, accion, entidad, entidad_id)
  values (auth.uid(), 'liberar', 'publicaciones', p_id::text);
end;
$$;

create or replace function public.marcar_recogida(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.publicaciones
     set estado = 'recogido', recogido_en = now()
   where id = p_id and estado = 'reservado' and recolector_id = auth.uid()
  returning id into v_id;

  if v_id is null then
    raise exception 'no permitido' using errcode = '42501';
  end if;

  insert into public.auditoria (usuario_id, accion, entidad, entidad_id)
  values (auth.uid(), 'marcar_recogida', 'publicaciones', p_id::text);
end;
$$;

create or replace function public.cancelar_publicacion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.publicaciones
     set estado = 'cancelada'
   where id = p_id and estado = 'disponible' and generador_id = auth.uid()
  returning id into v_id;

  if v_id is null then
    raise exception 'no permitido' using errcode = '42501';
  end if;

  insert into public.auditoria (usuario_id, accion, entidad, entidad_id)
  values (auth.uid(), 'cancelar', 'publicaciones', p_id::text);
end;
$$;

revoke all on function public.reservar_publicacion(uuid) from public, anon;
revoke all on function public.liberar_publicacion(uuid) from public, anon;
revoke all on function public.marcar_recogida(uuid) from public, anon;
revoke all on function public.cancelar_publicacion(uuid) from public, anon;
grant execute on function public.reservar_publicacion(uuid) to authenticated;
grant execute on function public.liberar_publicacion(uuid) to authenticated;
grant execute on function public.marcar_recogida(uuid) to authenticated;
grant execute on function public.cancelar_publicacion(uuid) to authenticated;

-- =====================================================================
-- 5. Entregas recibidas en el punto de acopio (trazabilidad)
-- =====================================================================
create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  punto_id uuid not null,
  material_codigo text not null,
  kg numeric(10, 2) not null check (kg > 0 and kg <= 100000),
  recolector_id uuid references public.perfiles (id) on delete set null,
  registrado_por uuid not null default auth.uid() references public.perfiles (id) on delete restrict,
  fecha date not null default current_date,
  creado_en timestamptz not null default now(),
  -- FK compuesta: solo materiales que ese punto recibe (RN de HU-12).
  constraint entregas_material_del_punto foreign key (punto_id, material_codigo)
    references public.punto_materiales (punto_id, material_codigo) on delete restrict
);

create index entregas_punto_fecha_idx on public.entregas (punto_id, fecha);
create index entregas_material_idx on public.entregas (material_codigo);
create index entregas_recolector_idx on public.entregas (recolector_id);
create index entregas_registrado_por_idx on public.entregas (registrado_por);

alter table public.entregas enable row level security;
revoke all on public.entregas from anon, authenticated;
grant select, insert on public.entregas to authenticated;

create policy "entregas visibles para el dueño del punto o admin"
  on public.entregas for select to authenticated
  using (
    public.rol_actual() = 'admin'
    or exists (select 1 from public.puntos_acopio p where p.id = punto_id and p.admin_id = (select auth.uid()))
  );

create policy "dueño del punto registra entregas"
  on public.entregas for insert to authenticated
  with check (
    registrado_por = (select auth.uid())
    and public.rol_actual() = 'admin_acopio'
    and exists (select 1 from public.puntos_acopio p where p.id = punto_id and p.admin_id = (select auth.uid()))
  );

-- =====================================================================
-- 6. Calificaciones al recolector
-- =====================================================================
create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null unique references public.publicaciones (id) on delete cascade,
  generador_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  recolector_id uuid not null references public.perfiles (id) on delete cascade,
  puntaje smallint not null check (puntaje between 1 and 5),
  comentario text check (char_length(comentario) <= 300),
  creado_en timestamptz not null default now()
);

create index calificaciones_recolector_idx on public.calificaciones (recolector_id);
create index calificaciones_generador_idx on public.calificaciones (generador_id);

alter table public.calificaciones enable row level security;
revoke all on public.calificaciones from anon, authenticated;
grant select, insert on public.calificaciones to authenticated;

create policy "calificación visible para participantes o admin"
  on public.calificaciones for select to authenticated
  using (
    generador_id = (select auth.uid())
    or recolector_id = (select auth.uid())
    or public.rol_actual() = 'admin'
  );

create policy "generador califica su recojo terminado"
  on public.calificaciones for insert to authenticated
  with check (
    generador_id = (select auth.uid())
    and exists (
      select 1 from public.publicaciones p
      where p.id = publicacion_id
        and p.generador_id = (select auth.uid())
        and p.estado = 'recogido'
        and p.recolector_id = calificaciones.recolector_id
    )
  );

-- Índice de auditoría para la consulta del admin (HU-08)
create index if not exists auditoria_creado_en_idx on public.auditoria (creado_en desc);
create index if not exists auditoria_usuario_idx on public.auditoria (usuario_id);
