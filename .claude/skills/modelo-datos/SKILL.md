---
name: modelo-datos
description: Fase 4. Diseña las tablas del caso y crea migraciones Supabase seguras (RLS, políticas por rol, checks, índices, auditoría) y ajusta roles. Usar antes de implementar HU que necesiten datos.
---

# Modelo de datos seguro

1. Ajusta roles: `src/lib/roles.ts` (ROLES) y el CHECK `perfiles.rol` en la migración base
   `20261119000000_perfiles_y_auditoria.sql` — SOLO si aún no se hizo el primer `db push`;
   si ya se aplicó, crea migración nueva con `alter table ... drop constraint / add constraint`.
2. Crea migración: `npx supabase migration new <nombre_en_snake_case>` y escribe el SQL ahí.
3. Por cada tabla:
   - `id uuid primary key default gen_random_uuid()` (o identity), `creado_en timestamptz default now()`.
   - FKs con `on delete` explícito; `check` para estados/montos (ej. `monto >= 0`, `estado in (...)`).
   - Índices en FKs y columnas de filtro.
   - **GRANT explícito** (el proyecto NO da acceso automático a tablas nuevas):
     `revoke all on public.<t> from anon, authenticated;` y luego solo lo necesario, ej.
     `grant select, insert, update on public.<t> to authenticated;` (a `anon` solo si hay lectura
     pública justificada). Sin GRANT la app recibe "permission denied" aunque RLS esté bien.
   - `alter table ... enable row level security;` + políticas `select/insert/update/delete` por rol
     usando `public.rol_actual()` y `(select auth.uid())`. Nada de `using (true)` salvo lectura pública justificada.
   - Funciones `security definer` siempre con `set search_path = ''` y `revoke ... from public, anon`.
4. Datos de prueba: `supabase/seed.sql` (nunca contraseñas reales).
5. Verifica: `node scripts/verificar-rls.mjs`.
6. Aplicar: el pipeline lo hace en la etapa 3. En local, solo si el usuario lo pide:
   `npx supabase db push` (explica antes que modifica la BD remota).
7. Actualiza el erDiagram de docs/03-arquitectura.md si cambió el modelo.
