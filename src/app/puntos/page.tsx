import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { MATERIALES } from "@/lib/materiales";
import { listarPuntosPublicos } from "@/features/puntos/datos";
import { esquemaFiltroPuntos, estaAbierto, filtrarPuntos, horaLima } from "@/features/puntos/validacion";

export const metadata = { title: "Puntos de acopio · EcoGreen" };

const nombreMaterial = (c: string) => MATERIALES.find((m) => m.codigo === c);

export default async function PaginaPuntos({ searchParams }: PageProps<"/puntos">) {
  const params = await searchParams;
  const filtro = esquemaFiltroPuntos.parse({ material: params.material, distrito: params.distrito });
  const supabase = await crearClienteServidor();
  const puntos = filtrarPuntos(await listarPuntosPublicos(supabase), filtro);
  const ahora = horaLima(new Date());

  return (
    <>
      <p className="etiqueta text-musgo">Directorio</p>
      <h1 className="titular mt-3 text-5xl text-bosque sm:text-6xl">
        ¿Dónde <em className="resaltado">entrego</em> mis reciclables?
      </h1>

      <form method="get" className="mt-8 grid gap-3 rounded-[2rem] bg-papel-2 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Material
          <select name="material" defaultValue={filtro.material ?? ""} className="campo">
            <option value="">Todos los materiales</option>
            {MATERIALES.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Distrito
          <input name="distrito" maxLength={80} defaultValue={filtro.distrito ?? ""} placeholder="Ej. Surco" className="campo" />
        </label>
        <button className="boton boton-primario self-end">Buscar</button>
      </form>

      {puntos.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
          <p className="titular text-3xl text-hoja">Sin resultados</p>
          <p className="mt-2 text-tinta/70">Prueba con otro distrito o elige &quot;Todos los materiales&quot; para ampliar la búsqueda.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {puntos.map((p) => {
            const abierto = estaAbierto(p.hora_apertura, p.hora_cierre, ahora);
            return (
              <li key={p.id}>
                <Link
                  href={`/puntos/${p.id}`}
                  className="group flex h-full flex-col rounded-[1.75rem] border-2 border-tinta bg-[#fffdf6] p-6 transition hover:-translate-y-0.5 hover:bg-brote/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="titular text-3xl text-bosque">{p.nombre}</h2>
                    <span
                      className={`etiqueta shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] ${
                        abierto ? "bg-brote text-bosque" : "bg-papel-2 text-tinta/60"
                      }`}
                    >
                      {abierto ? "Abierto ahora" : "Cerrado"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-tinta/70">
                    {p.direccion} · {p.distrito}
                  </p>
                  <p className="mt-1 text-sm text-tinta/70">
                    {p.dias_atencion} · {p.hora_apertura.slice(0, 5)} – {p.hora_cierre.slice(0, 5)}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.materiales.map((c) => (
                      <li key={c} className="flex items-center gap-1.5 rounded-full bg-papel-2 px-2.5 py-1 text-xs">
                        <span className={`h-2 w-2 rounded-full ${nombreMaterial(c)?.color ?? ""}`} aria-hidden="true" />
                        {nombreMaterial(c)?.nombre ?? c}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
