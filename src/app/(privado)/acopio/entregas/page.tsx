import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { MATERIALES } from "@/lib/materiales";
import { obtenerMiPunto } from "@/features/puntos/datos";
import { entregasDelPunto } from "@/features/impacto/datos";
import { registrarEntrega } from "@/features/impacto/actions";

const AVISOS: Record<string, { texto: string; ok: boolean }> = {
  ok: { texto: "Entrega registrada.", ok: true },
  material: { texto: "Tu punto no recibe ese material.", ok: false },
  error: { texto: "Revisa los datos: kg mayor a 0 y un material válido.", ok: false },
};

export default async function PaginaEntregas({ searchParams }: PageProps<"/acopio/entregas">) {
  const { supabase, user } = await exigirRol(rolesPara("/acopio/entregas"));
  const { aviso } = await searchParams;
  const a = typeof aviso === "string" ? AVISOS[aviso] : undefined;
  const punto = await obtenerMiPunto(supabase, user.id);

  if (!punto) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
        <p className="titular text-3xl text-hoja">Primero publica tu punto</p>
        <Link href="/acopio" className="boton boton-primario mt-4">
          Ir a Mi punto de acopio
        </Link>
      </div>
    );
  }

  const entregas = await entregasDelPunto(supabase, punto.id);
  const total = entregas.reduce((s, e) => s + Number(e.kg), 0);
  const materiales = MATERIALES.filter((m) => punto.materiales.includes(m.codigo));

  return (
    <>
      <p className="etiqueta text-musgo">{punto.nombre}</p>
      <h1 className="titular mt-3 text-5xl text-bosque">Entregas recibidas</h1>
      {a && (
        <p
          role={a.ok ? "status" : "alert"}
          className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
            a.ok ? "border-hoja/30 bg-brote/40 text-bosque" : "border-alerta/30 bg-alerta/10 text-alerta"
          }`}
        >
          {a.texto}
        </p>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <form action={registrarEntrega} className="flex flex-col gap-4 self-start rounded-[2rem] bg-bosque p-6 text-papel md:p-8">
          <p className="titular text-3xl">
            Registrar <em className="text-brote">entrega</em>
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Material
            <select name="material" required className="campo">
              {materiales.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Peso (kg)
            <input name="kg" type="number" step="0.01" min="0.01" max="100000" required className="campo" />
          </label>
          <button className="boton bg-brote text-bosque hover:bg-papel">Registrar</button>
        </form>
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="etiqueta text-musgo">Últimas entregas</h2>
            <p className="titular text-3xl text-hoja">{Math.round(total * 100) / 100} kg</p>
          </div>
          {entregas.length === 0 ? (
            <p className="mt-4 rounded-[1.5rem] border-2 border-dashed border-linea p-8 text-center text-tinta/60">
              Aún no registras entregas.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {entregas.map((e) => {
                const m = MATERIALES.find((x) => x.codigo === e.material_codigo);
                return (
                  <li key={e.id} className="flex items-center justify-between rounded-2xl border border-linea bg-[#fffdf6] px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-[4px] ${m?.color ?? ""}`} aria-hidden="true" />
                      <span className="font-medium">{m?.nombre ?? e.material_codigo}</span>
                      <span className="text-sm text-tinta/55">{e.fecha}</span>
                    </span>
                    <span className="titular text-2xl text-bosque">{Number(e.kg)} kg</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
