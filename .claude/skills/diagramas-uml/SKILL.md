---
name: diagramas-uml
description: Diagramas UML y de análisis del caso - casos de uso con actores, contexto del sistema, clases de dominio, secuencia, actividades, estados, componentes, paquetes y despliegue - con su especificación. Usar cuando el profesor pida "diagrama de actores", "de casos de uso", "del sistema", "de clases", "de secuencia" o similares.
---

# Diagramas UML

Salida: `docs/04-diagramas-uml.md`, con un bloque ```mermaid por diagrama (GitHub lo renderiza) y,
debajo de cada uno, 2-4 líneas que lo explican. Usa los actores, RF y tablas reales de
`docs/01-analisis.md`, `docs/02-backlog.md` y `supabase/migrations`. Haz solo los que pida el caso;
si no especifica, haz los 5 primeros.

## 1. Diagrama de actores (jerarquía de actores)
Mermaid no tiene actores UML: usa `flowchart TB` con nodos `A1(["👤 Admin"])` y flechas de
generalización `Usuario autenticado <|-- Admin` expresadas como `A2 -->|es un| A1`. Incluye también
los actores externos (sistemas: pasarela de pagos, correo, Supabase Auth) con el estereotipo «sistema».
Tabla: actor, tipo (primario/secundario/sistema), descripción, rol en `src/lib/roles.ts`.

## 2. Diagrama de casos de uso
`flowchart LR`: actores a la izquierda/derecha como `(["👤 Nombre"])`, un `subgraph Sistema[NOMBRE DEL SISTEMA]`
con casos de uso como óvalos `CU01([CU01 Registrar pedido])`. Relaciones:
- asociación: `Actor --- CU01`
- include: `CU01 -.->|«include»| CU05`
- extend: `CU07 -.->|«extend»| CU01`
Un CU por RF (CU01 ↔ RF-01 ↔ HU-01). Si son muchos, divide un diagrama por módulo/épica.

**Especificación** (tabla por cada CU principal, mínimo los Must): ID, nombre, actor, precondición,
flujo básico (pasos numerados), flujos alternos / excepciones (incluye "rol no autorizado"),
postcondición, RF y HU relacionados.

## 3. Diagrama de contexto del sistema (C4 nivel 1)
`flowchart`: el sistema al centro, actores y sistemas externos alrededor, flechas con lo que intercambian.

## 4. Diagrama de clases (dominio)
`classDiagram` derivado de las tablas: atributos con tipo, métodos de dominio (ej. `calcularTotal()`),
multiplicidades `"1" --> "*"`, composición `*--` / agregación `o--`, enumeraciones `<<enumeration>>` para estados y roles.

## 5. Diagrama de secuencia (flujo principal y uno de seguridad)
`sequenceDiagram` con participantes: Actor, Navegador, Next.js (page/proxy), Server Action, Capa datos,
Supabase Auth, PostgreSQL (RLS). Muestra `alt` rol válido / rol no autorizado y la validación zod.

## 6. Diagrama de actividades
`flowchart TD` con inicio `((●))`, decisiones `{¿...?}`, fin `(((◉)))`. Usa `subgraph` como swimlanes por actor.

## 7. Diagrama de estados
`stateDiagram-v2` para la entidad con estados (pedido, solicitud, reserva...). Debe coincidir con el
CHECK de la columna `estado` en la migración.

## 8. Diagrama de componentes y paquetes
`flowchart` con subgraphs: `src/app` (pantallas), `src/features/*` (actions, datos, validacion),
`src/lib` (supabase, auth, roles), servicios externos. Las flechas muestran dependencias permitidas.

## 9. Diagrama de despliegue (hardware)
Lo hace la skill `arquitectura` (punto 6). Aquí solo enlázalo.

## Opcional: PlantUML / draw.io
- Si el profesor pide notación UML estricta (monigotes, óvalos), agrega también `docs/diagramas/<n>.puml`
  (PlantUML: `actor`, `usecase`, `rectangle`, `<<include>>`). El usuario lo renderiza en plantuml.com
  o con la extensión PlantUML de VS Code.
- Si lo pide en draw.io: `docs/diagramas/<n>.drawio` en XML mxGraph válido; en draw.io usar las
  formas `shape=umlActor` para actores y `ellipse` para casos de uso.

## Revisión final
Mismos nombres en todos los diagramas. Cada CU tiene una HU y cada clase tiene una tabla, y viceversa.
Los roles coinciden con `roles.ts`.

## Exportar a PNG (para el Word)
Cada diagrama también en `docs/diagramas/<n>.mmd`, luego:
`mmdc -i docs/diagramas/<n>.mmd -o docs/img/<n>.png -b white -s 2 -p .claude/puppeteer-config.json`
Revisa el PNG con Read (texto cortado, cruces) y ajusta antes de seguir.
