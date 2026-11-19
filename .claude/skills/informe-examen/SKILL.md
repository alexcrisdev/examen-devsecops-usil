---
name: informe-examen
description: Arma el informe entregable del examen (formato PC2 del curso Proyecto Final de Carrera III, prof. Neira) en docs/INFORME.md y luego en Word, con las 4 preguntas - DevOps y stack, diagramas (actores, casos de uso, arquitectura lógica y física), Scrum (backlog, épicas, estimación, sprints, ceremonias, DoD, criterios) e implementación (ER 3FN, relacional vs NoSQL, MVP, branching, pipeline). Usar al final o cuando el usuario pida "el informe" o "el documento".
---

# Informe del examen

Referencias reales del curso (ciclo anterior): PC2 ChambeaGo (Leandro Carrasco) y PC2 GamarraYa
(Vercel + Supabase, mismo stack que el nuestro). El profesor espera ESTA estructura. Si el enunciado
del examen pide otra cosa, manda el enunciado.

Fuentes: docs/00-caso.md, 01-analisis.md, 02-backlog.md, 03-arquitectura.md, 04-diagramas-uml.md,
05-seguridad.md, migraciones, `gh run list`, URL de producción. No inventes links ni números.

## Portada
Universidad San Ignacio de Loyola – Facultad de Ingeniería · Título (PC / Examen) · Curso: Proyecto
Final de Carrera III · Docente: NEIRA NEIRA, KENNY DISNEY · Bloque: (preguntar) · Alumno: Crisóstomo, Alexander · 2026-2.
Debajo: **Link del Deploy** y **Repositorio** (GitHub).

## Pregunta 1 – Enfoque DevSecOps y stack tecnológico
1. **Principios DevOps/DevSecOps aplicados** (1 párrafo): Dev + Ops + Sec, mejora continua, el ciclo
   infinito, seguridad desde el inicio (shift-left).
2. **Ciclo de vida** con un subtítulo por fase y QUÉ HICIMOS de verdad en cada una:
   Plan (Jira, épicas, HU, sprints) · Code (Next.js/TS, ramas hu/ → develop → main, PR) · Build
   (`next build` en CI) · Test (Vitest + cobertura, smoke) · Release (PR develop→main, branch protection,
   checks obligatorios) · Deploy (pipeline: migraciones Supabase + Vercel CLI) · Operate (Vercel
   serverless, Supabase gestionado, backups) · Monitor (logs Vercel/Supabase, auditoría, Dependabot,
   escaneo semanal). **Seguridad en cada fase** (tabla fase → control: Gitleaks, CodeQL, npm audit,
   dependency review, RLS check, ZAP, cabeceras, zod, RLS).
3. **Stack tecnológico**: tabla Capa | Tecnología | Versión (de package.json) | Justificación.
   Capas: Frontend, Framework full stack, Lenguaje, Estilos, Validación, Autenticación, Base de datos,
   Seguridad de datos (RLS), Hosting, CI/CD, Seguridad (SAST/SCA/DAST/secretos), Pruebas, Versiones, Gestión.
4. **Vínculo entre DevSecOps y el problema** (2-3 párrafos ligados al caso real).

## Pregunta 2 – Diagramas de casos de uso y arquitecturas
1. **Diagrama de actores** (imagen) + tabla de actores.
2. **Diagrama de casos de uso** (imagen).
3. **Descripción de los casos de uso**: tabla ID | Nombre | Actor(es) | Objetivo | Precondiciones | Postcondiciones.
4. **Arquitectura lógica** (imagen) + párrafo "componentes y relaciones" (capas, protocolos HTTPS/TLS, JWT, RLS).
5. **Arquitectura física en nube** (imagen: cliente → Vercel Edge/CDN → Vercel Functions → Supabase
   en AWS sa-east-1; GitHub Actions) + párrafo "justificación de los servicios nube seleccionados"
   (escalabilidad, disponibilidad, seguridad, costo 0, integración).
6. Si el caso lo pide: clases, secuencia, ER (ver skill `diagramas-uml`).

## Pregunta 3 – Planificación con Scrum
a. **Product Backlog**: tabla ID | Épica | Historia de usuario (Como… quiero… para…) | Criterios | Prioridad (Alta/Media/Baja) | SP.
b. **Épicas**: tabla ID | Épica | Descripción | Objetivo | Sprint.
c. **Roles** (PO, Scrum Master, Dev Team) y **técnica de estimación**: Planning Poker con Fibonacci
   (1,2,3,5,8,13), criterios: complejidad, componentes (UI/lógica/BD), incertidumbre; explica por qué las 8 SP son 8.
d. **Capacity y velocidad**: duración de sprint, total SP, SP por sprint (ej. 47 SP / 2 sprints ≈ 24 SP).
e. **Sprint Backlog**: tabla Sprint | ID-HU | HU | SP, con Sprint Goal por sprint.
f. **Ceremonias**: Planning, Daily, Review, Retrospective (qué se hace y duración).
g. **Definition of Done**: tabla N° | Criterio | Descripción (incluye pipeline verde y seguridad).
h. **Criterios de aceptación** por HU (Gherkin Dado/Cuando/Entonces; al menos uno de seguridad).
i. **Evidencia Jira**: board, backlog, burndown (placeholders de captura).

## Pregunta 4 – Implementación y despliegue en nube
1. Link del MVP y del repo.
2. **Diagrama ER** (imagen) + justificación **3FN** (1FN atómicos y PK, 2FN sin dependencias
   parciales, 3FN sin transitivas, con ejemplos de nuestras tablas).
3. **Relacional vs NoSQL**: por qué relacional (datos estructurados y relacionados, integridad
   referencial, transacciones, RLS).
4. **Funcionalidades núcleo del MVP**: una captura por pantalla con 1 línea de descripción.
5. **Estrategia de branching**: main / develop / hu/HU-XX, PR, protección de ramas (diagrama gitGraph).
6. **Historial de commits** con mensajes `HU-XX:` (captura o `git log --oneline`).
7. **Despliegue en Vercel**: production vs preview, variables de entorno (sin valores).
8. **Pipeline CI/CD DevSecOps**: diagrama de las 6 etapas + captura del run verde + Summary de seguridad
   + reporte ZAP + alertas CodeQL.

## Generar el Word
1. Diagramas → PNG en `docs/img/`: guarda cada diagrama en `docs/diagramas/<n>.mmd` y conviértelo con `mmdc -i docs/diagramas/<n>.mmd -o docs/img/<n>.png -b white -s 2 -p .claude/puppeteer-config.json` (usa el Chrome instalado; mira el PNG con Read antes de insertarlo);
   si no, pide al usuario pegarlos en https://mermaid.live → Actions → PNG.
2. Capturas del usuario en `docs/img/capturas/` con nombres de la lista de `/evidencias`.
3. Usa la skill **docx** para convertir docs/INFORME.md a `docs/INFORME.docx`: títulos por pregunta,
   tablas con bordes, imágenes centradas con pie "Figura N. …", índice al inicio.
4. Marca con «CAPTURA PENDIENTE: …» lo que falte, para que el usuario lo vea de un vistazo.
