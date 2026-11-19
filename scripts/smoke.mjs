// Smoke test post-despliegue: solo GET, no escribe datos.
// Uso: node scripts/smoke.mjs https://mi-app.vercel.app
// AGREGAR una línea por cada ruta privada nueva del caso.

const base = (process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Si los previews de Vercel están protegidos, el pipeline manda el secreto de bypass.
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const headers = bypass ? { "x-vercel-protection-bypass": bypass } : {};

async function pedir(ruta) {
  const respuesta = await fetch(base + ruta, { redirect: "manual", headers });
  const texto = respuesta.status === 200 ? await respuesta.text() : "";
  return { respuesta, texto };
}

const redirigeALogin = (r) =>
  [302, 303, 307, 308].includes(r.status) && (r.headers.get("location") ?? "").includes("/login");

const pruebas = [
  ["Inicio responde 200", async () => (await pedir("/")).respuesta.status === 200],
  ["Health check /api/salud", async () => {
    const { respuesta, texto } = await pedir("/api/salud");
    return respuesta.status === 200 && texto.includes("ok");
  }],
  ["Login muestra el formulario", async () => {
    const { respuesta, texto } = await pedir("/login");
    return respuesta.status === 200 && texto.includes("<form");
  }],
  ["/panel exige iniciar sesión", async () => redirigeALogin((await pedir("/panel")).respuesta)],
  ["Cabeceras de seguridad presentes", async () => {
    const { respuesta } = await pedir("/login");
    return ["x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"].every((c) =>
      respuesta.headers.has(c),
    );
  }],
  ["No expone X-Powered-By", async () => !(await pedir("/")).respuesta.headers.has("x-powered-by")],
];

console.log(`Smoke test contra ${base}\n`);
let fallas = 0;
for (const [nombre, prueba] of pruebas) {
  let ok = false;
  try {
    ok = await prueba();
  } catch (error) {
    console.log(`  (error de red: ${error.message})`);
  }
  if (!ok) fallas++;
  console.log(`${ok ? "OK   " : "FALLA"}  ${nombre}`);
}
console.log(`\n${pruebas.length - fallas}/${pruebas.length} pruebas correctas`);
process.exit(fallas === 0 ? 0 : 1);
