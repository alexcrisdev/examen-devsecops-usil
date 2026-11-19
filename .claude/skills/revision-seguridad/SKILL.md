---
name: revision-seguridad
description: Fase 6. Revisión de seguridad del código y la configuración contra OWASP Top 10 2021, ASVS básico y STRIDE; corrige lo crítico y documenta en docs/05-seguridad.md con evidencias del pipeline. Usar antes de cada merge a main y al final del examen.
---

# Revisión de seguridad

Puedes delegar el análisis al subagente `revisor-seguridad` y luego aplicar las correcciones.

## Checklist (revisa el código real, cita archivo:línea)
- **A01 Control de acceso**: toda Server Action llama `exigirRol`; RLS en todas las tablas; sin IDOR
  (filtrar por dueño); rutas privadas en `proxy.ts`.
- **A02 Criptografía**: HTTPS (Vercel), contraseñas solo en Supabase Auth, sin secretos en código.
- **A03 Inyección**: zod en servidor; consultas vía supabase-js (parametrizadas); sin `dangerouslySetInnerHTML`.
- **A04 Diseño inseguro**: reglas de negocio en servidor; límites (montos, cantidades, longitudes).
- **A05 Configuración**: cabeceras en `next.config.ts`; `poweredByHeader:false`; errores genéricos.
- **A06 Componentes vulnerables**: `npm audit --omit=dev`; Dependabot activo.
- **A07 Autenticación**: mensajes genéricos; política de contraseña en Supabase Auth; confirmar email.
- **A08 Integridad**: lockfile + `npm ci`; acciones de GitHub con versión fija; branch protection.
- **A09 Logging**: tabla `auditoria` para acciones sensibles; logs de Vercel.
- **A10 SSRF**: no hacer fetch a URLs que manda el usuario.

## Salida: docs/05-seguridad.md
1. Tabla OWASP → control → archivo/evidencia → estado (OK / Mitigado / Pendiente).
2. STRIDE del sistema (puede reutilizar el de arquitectura) con controles reales.
3. Controles del pipeline: Gitleaks, CodeQL, npm audit, dependency review, RLS check, smoke, ZAP —
   qué detecta cada uno y link al run de Actions (`gh run list --limit 5`).
4. Hallazgos y correcciones hechas en esta revisión.
5. Riesgos residuales aceptados.
