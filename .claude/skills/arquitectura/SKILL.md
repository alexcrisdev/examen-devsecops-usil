---
name: arquitectura
description: Fase 3. Genera los diagramas de arquitectura de software y de hardware/infraestructura (C4, despliegue, ER, secuencia, DevSecOps, amenazas) en Mermaid dentro de docs/03-arquitectura.md, y opcionalmente en .drawio en docs/diagramas/.
---

# Arquitectura (software + hardware)

Escribe `docs/03-arquitectura.md` con un bloque ```mermaid por diagrama (GitHub los renderiza) y
2-4 líneas de explicación debajo de cada uno. Usa los nombres reales del caso.

## Arquitectura de software
1. **C4 Nivel 1 – Contexto**: actores (roles) → Sistema → sistemas externos (correo, pagos, etc.).
2. **C4 Nivel 2 – Contenedores**: Navegador (React) → Next.js en Vercel (Server Components, Server
   Actions, proxy.ts) → Supabase (Auth, PostgreSQL con RLS, Storage). Protocolos (HTTPS/TLS 1.3, JWT).
3. **Componentes / capas**: page.tsx → actions.ts (exigirRol + zod) → datos.ts → Supabase. Una caja por feature.
4. **Modelo de datos (erDiagram)**: tablas de las migraciones, PK/FK, cardinalidades.
5. **Secuencia** del flujo principal del caso (incluye validación de rol y RLS).

## Arquitectura de hardware / infraestructura (despliegue)
6. **Despliegue físico/lógico** (flowchart con subgraphs):
   - Cliente: PC / smartphone, navegador, red del usuario (internet).
   - Borde: DNS + CDN/Edge Network de Vercel (TLS, WAF/firewall, DDoS mitigation).
   - Cómputo: Vercel Functions (Node.js 22, serverless, región iad1/gru1) .
   - Datos: Supabase (AWS, región elegida): PostgreSQL gestionado, backups diarios, pooler.
   - CI/CD: GitHub (repo, Actions runners ubuntu-latest), secretos cifrados.
   - Indica zonas de confianza (internet / borde / app / datos) y qué cruza cada frontera.
7. **Pipeline DevSecOps** (flowchart LR): commit → PR → CI (lint, tipos, pruebas, build) → Seguridad
   (Gitleaks, CodeQL SAST, npm audit SCA, dependency review, RLS) → Migraciones → Deploy Vercel → Smoke → DAST ZAP.
   Mapea a fases DevSecOps: Plan, Code, Build, Test, Release, Deploy, Operate, Monitor.

## Seguridad
8. **Modelo de amenazas STRIDE**: tabla amenaza → componente → control implementado → evidencia.

## Decisiones (ADR corto)
Tabla: decisión, alternativas, por qué (ej. Supabase vs servidor propio, serverless vs VM, RLS).

## Draw.io (solo si el usuario lo pide)
Genera `docs/diagramas/<nombre>.drawio` en XML mxGraph válido (mxfile > diagram > mxGraphModel)
con formas simples; el usuario lo abre en draw.io para exportar a PNG.
