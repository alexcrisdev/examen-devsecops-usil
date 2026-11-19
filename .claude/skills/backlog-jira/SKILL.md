---
name: backlog-jira
description: Fase 2. Convierte docs/01-analisis.md en backlog ágil para Jira - épicas, historias de usuario con criterios Gherkin, story points, prioridad y sprints - en docs/02-backlog.md y un CSV importable a Jira (docs/jira-import.csv).
---

# Backlog para Jira

## Reglas
- Tabla de épicas con columnas ID | Épica | Descripción | Objetivo | Sprint (formato del curso).
- Épicas `EP-01..` agrupadas por funcionalidad (ej. Autenticación y roles, módulo X, Reportes, DevSecOps).
  Incluye SIEMPRE una épica **DevSecOps / Infraestructura** (pipeline CI, seguridad, despliegue, monitoreo).
- Historias `HU-01..` formato: **Como** <rol> **quiero** <acción> **para** <beneficio>.
- Cada HU: 2-4 criterios de aceptación en Gherkin (Dado/Cuando/Entonces), al menos uno de seguridad
  (ej. "Dado un usuario sin rol X, cuando intenta..., entonces recibe acceso denegado").
- Story points por Planning Poker, Fibonacci (1,2,3,5,8,13); documenta la técnica y la capacity (SP totales / sprints). Prioridad: Highest/High/Medium/Low. Etiqueta `seguridad` si aplica.
- Definition of Done común (copiar al inicio del backlog): pruebas en verde, pipeline verde,
  revisión de seguridad, desplegado en staging, criterios cumplidos.
- Sprints: Sprint 0 (setup DevSecOps: repo, pipeline, Supabase, Vercel), Sprint 1 (núcleo MVP),
  Sprint 2 (resto + reportes). Muestra objetivo y capacidad de cada sprint.
- Trazabilidad: tabla RF → HU → épica. Actualiza la columna HU de docs/01-analisis.md.

## docs/02-backlog.md
DoD, tabla de épicas, HU completas por épica, plan de sprints, matriz de trazabilidad.

## docs/jira-import.csv (UTF-8, coma, comillas dobles)
Columnas exactas:
`Issue Id,Issue Type,Summary,Description,Parent,Priority,Story Points,Labels,Sprint`
- Épicas: Issue Type `Epic`, Issue Id `1..n`, Parent vacío.
- Historias: Issue Type `Story`, Parent = Issue Id de su épica. Labels separadas por espacio.
- **Description OBLIGATORIA con la HU y TODOS sus criterios de aceptación**, en un campo entre comillas
  dobles con saltos de línea REALES (no el texto `\n`) y en wiki markup de Jira. Formato exacto:
  ```
  "Como <rol> quiero <acción> para <beneficio>.

  *Criterios de aceptación:*
  # Dado <contexto>, cuando <acción>, entonces <resultado>.
  # Dado <usuario sin rol X>, cuando <intenta...>, entonces <acceso denegado>. (seguridad)

  *Story points:* <n> · *Prioridad:* <p>"
  ```
  Si un texto lleva comillas dobles, escápalas duplicándolas (`""`). Las épicas llevan también
  Description (descripción + objetivo).
- Valida el CSV antes de entregarlo: léelo con un parser (`node -e` con un split por comillas o Python `csv`)
  y comprueba el número de filas y que cada HU tenga sus criterios en Description.
- Subtareas opcionales: Issue Type `Sub-task`, Parent = Issue Id de la HU.
- Importación (probada el 19/11 en el espacio team-managed "Examen DevSecOps", clave EXD):
  ⚙️ → System → External system import → CSV → elegir el espacio. Mapeo: Issue Id → Work item id,
  Issue Type → Work Type, Story Points → **Story point estimate**, Parent → Parent, Sprint → Sprint
  (está en la página 2 del mapeo). Map values: Epic → Epic, Story → Story.
  Los sprints deben existir antes en el Backlog con el nombre EXACTO de la columna Sprint
  (`Sprint 0`, `Sprint 1`, `Sprint 2`); si se cambia el nombre en Jira, cambia el CSV.
