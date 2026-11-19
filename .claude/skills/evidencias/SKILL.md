---
name: evidencias
description: Fase 7 (cierre del examen). Reúne links y evidencias - repo, URL de producción y staging, runs del pipeline, alertas de seguridad, Jira - y escribe el README final y docs/06-evidencias.md con la lista de capturas a tomar.
---

# Evidencias y entrega

1. Recolecta con comandos (no inventes links):
   - `gh repo view --json url -q .url`
   - `gh run list --limit 10` y `gh run view <id> --json url,conclusion,jobs`
   - URL de producción: output de la etapa 4 del último pipeline en main.
   - `gh api repos/{owner}/{repo}/code-scanning/alerts --jq length` (alertas CodeQL)
2. **README.md**: nombre, problema, solución, stack, arquitectura (enlace a docs/03), cómo correr local,
   variables (sin valores), pipeline con diagrama, seguridad (resumen), links de entrega, autor.
3. **docs/06-evidencias.md**: tabla Evidencia → dónde se ve → link → captura (nombre de archivo).
   Capturas sugeridas: tablero Jira + backlog, gráfico del Pipeline verde, Summary de Seguridad,
   pestaña Security (CodeQL/Dependabot), reporte ZAP, app en producción (login y flujo principal),
   tablas con RLS en Supabase, variables en Vercel (valores ocultos), branch protection.
4. Checklist final: pipeline de main en verde, app abre en producción, docs 01-06 completos,
   CSV importado a Jira, nada de secretos en el repo (`git log -p | grep -i "service_role"` vacío).
