// Control DevSecOps: cada `create table` en supabase/migrations debe tener su
// `enable row level security`. Sin RLS, la clave pública da acceso total a la tabla.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const carpeta = "supabase/migrations";
const sql = readdirSync(carpeta)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(carpeta, f), "utf8").replace(/--.*$/gm, ""))
  .join("\n")
  .toLowerCase();

const normalizar = (t) => t.replace(/"/g, "").replace(/^public\./, "");
const creadas = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."]+)/g)].map((m) => normalizar(m[1]));
const conRls = new Set(
  [...sql.matchAll(/alter\s+table\s+(?:only\s+)?([\w."]+)\s+enable\s+row\s+level\s+security/g)].map((m) => normalizar(m[1])),
);

// Aviso (no bloquea): tabla sin GRANT = la app no la puede usar salvo con service_role.
const conGrant = new Set(
  [...sql.matchAll(/grant\s+[^;]*?\s+on\s+(?:table\s+)?([\w."]+)\s+to\s+[^;]*(authenticated|anon)/g)].map((m) => normalizar(m[1])),
);
for (const t of creadas.filter((t) => !conGrant.has(t))) {
  console.warn(`AVISO: ${t} no tiene GRANT a authenticated/anon (solo accesible con service_role).`);
}

const sinRls = creadas.filter((t) => !conRls.has(t));
console.log(`Tablas encontradas: ${creadas.length}. Con RLS: ${creadas.length - sinRls.length}.`);
if (sinRls.length) {
  console.error(`FALLA: tablas sin RLS -> ${sinRls.join(", ")}`);
  process.exit(1);
}
console.log("OK: todas las tablas tienen RLS activado.");
