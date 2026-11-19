@AGENTS.md

# Harness del examen DevSecOps (reglas para el agente de IA)

Quien te habla es el desarrollador del examen. Explica en español simple qué hiciste y por qué.
Tiempo limitado (4 horas): prioriza un MVP que funcione y esté desplegado sobre algo perfecto a medias.

## Flujo obligatorio (en este orden, una skill por fase)
1. `/analizar-caso`      → docs/01-analisis.md (requisitos, actores, reglas, riesgos)
2. `/backlog-jira`       → docs/02-backlog.md + docs/jira-import.csv (épicas, HU, sprints)
3. `/arquitectura`       → docs/03-arquitectura.md (software + hardware/infra + datos + seguridad)
   `/diagramas-uml`      → docs/04-diagramas-uml.md (actores, casos de uso, clases, secuencia, estados...)
4. `/modelo-datos`       → migraciones en supabase/migrations con RLS
5. `/implementar-hu HU-XX` → una HU a la vez: rama, pruebas, código, verificación, commit, PR
6. `/revision-seguridad` → docs/05-seguridad.md (OWASP + STRIDE + evidencias de pipeline)
7. `/evidencias`         → README.md final + docs/06-evidencias.md
8. `/informe-examen`     → docs/INFORME.md + INFORME.docx con la estructura del curso (4 preguntas)
No avances de fase sin mostrar el resultado al usuario.

## Stack (no agregar librerías sin aprobación)
Next.js 16 (App Router, Server Actions) + React 19 + TypeScript + Tailwind 4 · Supabase
(PostgreSQL, Auth, RLS) · Vercel · GitHub Actions · Vitest · zod para validar.

## Arquitectura en capas por funcionalidad (obligatoria)
- `src/app/**/page.tsx` → pantallas. No acceden a datos directo.
- `src/features/<feature>/actions.ts` → Server Actions ("use server"): llaman `exigirRol`, validan con zod.
- `src/features/<feature>/datos.ts` → única capa que habla con Supabase.
- `src/features/<feature>/validacion.ts` → esquemas zod + reglas puras (aquí van las pruebas unitarias).
- `src/lib/` → compartido (supabase, auth, roles).

## Reglas de seguridad que no se rompen
- Toda acción de servidor empieza con `exigirRol([...])`. Nunca confíes en datos del navegador.
- Todo input se valida con zod en servidor. Mensajes de error genéricos (no filtrar detalles).
- Precios, totales, estados y roles los calcula/decide el servidor.
- Toda tabla nueva: `enable row level security` + políticas por rol. Lo verifica `scripts/verificar-rls.mjs`.
- `SUPABASE_SERVICE_ROLE_KEY` solo en `src/lib/supabase/admin.ts` (server-only). Nunca `NEXT_PUBLIC_` con secretos.
- Nunca leas, muestres ni edites `.env.local`. Nunca imprimas claves.
- Cada ruta privada nueva: agrégala al `matcher` de `src/proxy.ts` y una prueba en `scripts/smoke.mjs`.
- Acciones sensibles (crear/editar/eliminar/aprobar) se registran en la tabla `auditoria`.

## Base de datos
- Cambios SOLO con migraciones nuevas: `npx supabase migration new <nombre>`. Nunca edites una ya aplicada.
- Roles: `src/lib/roles.ts` y el CHECK de `perfiles.rol` deben coincidir.

## Git
- Ramas: `main` (producción) ← `develop` (staging) ← `hu/HU-XX-descripcion`.
- Commit: `HU-XX: descripción corta en español`. Commits pequeños. Sin línea Co-Authored-By.
- PR de la rama HU → `develop`. Nunca push --force, nunca commit directo en main/develop.

## Antes de decir "terminé" una HU
1. `npm run verificar` (lint + tipos + pruebas + build) en verde.
2. `node scripts/verificar-rls.mjs` en verde si tocaste migraciones.
3. Di qué archivos cambiaste y cómo probarlo en el navegador.
