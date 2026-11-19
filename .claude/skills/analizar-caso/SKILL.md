---
name: analizar-caso
description: Fase 1 del examen. Lee el caso del profesor (docs/00-caso.md o lo que pegue el usuario) y produce docs/01-analisis.md con actores, requisitos funcionales y no funcionales, reglas de negocio, supuestos y riesgos de seguridad. Usar al recibir el caso.
---

# Analizar el caso

1. Si el caso no está en `docs/00-caso.md`, guárdalo ahí textual (es la fuente de verdad).
2. Escribe `docs/01-analisis.md` con estas secciones, en tablas cuando se pueda:
   - **Contexto y problema** (3-5 líneas) y **objetivo del sistema**.
   - **Actores / roles** → nombre, qué hace, qué NO puede hacer. Estos serán los roles de `src/lib/roles.ts`.
   - **Requisitos funcionales** `RF-01..` → descripción, actor, prioridad MoSCoW, fuente (frase del caso).
   - **Requisitos no funcionales** `RNF-01..` → seguridad, rendimiento, disponibilidad, usabilidad,
     cumplimiento (Ley 29733 de datos personales si hay datos personales).
   - **Reglas de negocio** `RN-01..` → cada una debe poder probarse con un test.
   - **Supuestos** (lo que el caso no dice y decidimos) — márcalos para confirmarlos con el usuario.
   - **Riesgos de seguridad iniciales** → activo, amenaza, impacto, control previsto.
   - **Alcance MVP (4 horas)** → qué entra y qué queda fuera, justificado.
3. Trazabilidad: cada RF debe mapear luego a una HU. Deja una columna "HU" vacía.
4. Muestra un resumen corto al usuario y pregunta solo por supuestos que cambien el diseño.
