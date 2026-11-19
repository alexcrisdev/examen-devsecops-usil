---
name: implementar-hu
description: Fase 5. Implementa UNA historia de usuario (argumento HU-XX) con flujo DevSecOps - rama, prueba primero, código por capas, validación y rol, verificación, commit y PR a develop.
---

# Implementar una HU

Argumento: `HU-XX`. Lee su texto y criterios en `docs/02-backlog.md`.

1. **Rama**: `git switch develop && git pull` → `git switch -c hu/HU-XX-descripcion-corta`.
2. **Plan corto** (3-6 viñetas) de archivos a tocar. Muéstralo y sigue.
3. **Prueba primero**: en `tests/unit/<feature>.test.ts`, un test por criterio de aceptación que sea
   lógica pura (validación zod, cálculos, reglas de negocio, permisos). Incluye un caso malicioso
   (input inválido, rol no permitido, valor negativo, string enorme).
4. **Código** respetando capas de CLAUDE.md:
   - `validacion.ts` (zod + reglas puras) → `datos.ts` (Supabase) → `actions.ts` (`exigirRol` + safeParse) → `page.tsx`.
   - Migración nueva si hace falta (usa la skill `modelo-datos`).
   - Rutas privadas: `src/proxy.ts` matcher + prueba en `scripts/smoke.mjs`.
   - Acciones sensibles: insertar en `auditoria`.
5. **Verificar**: `npm run verificar`; si tocaste SQL, `node scripts/verificar-rls.mjs`. Corrige hasta verde.
6. **Commit**: `git add <archivos>` (nunca `git add .` a ciegas) → `git commit -m "HU-XX: ..."`.
7. **PR** (solo si el usuario lo confirma): `git push -u origin <rama>` →
   `gh pr create --base develop --title "HU-XX: ..." --body-file` usando la plantilla de PR, marcando criterios.
8. Resume: archivos cambiados, cómo probarlo, y qué criterio cubre cada test.
