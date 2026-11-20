import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/server";
import { MATERIALES } from "@/lib/materiales";
import { obtenerPuntoPublico } from "@/features/puntos/datos";
import { estaAbierto, horaLima } from "@/features/puntos/validacion";

export default async function DetallePunto({ params }: PageProps<"/puntos/[id]">) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await crearClienteServidor();
  const p = await obtenerPuntoPublico(supabase, id);
  if (!p) notFound(); // puntos inactivos tampoco se muestran

  const abierto = estaAbierto(p.hora_apertura, p.hora_cierre, horaLima(new Date()));
  return (
    <>
      <Link href="/puntos" className="text-sm font-semibold text-hoja">
        ← Volver al directorio
      </Link>
      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <section>
          <span
            className={`etiqueta inline-block rounded-full px-3 py-1 text-[0.65rem] ${
              abierto ? "bg-brote text-bosque" : "bg-papel-2 text-tinta/60"
            }`}
          >
            {abierto ? "● Abierto ahora" : "○ Cerrado ahora"}
          </span>
          <h1 className="titular mt-4 text-5xl text-bosque sm:text-6xl">{p.nombre}</h1>
          <p className="mt-4 text-lg text-tinta/80">
            {p.direccion}, {p.distrito}
          </p>
          {p.referencia && <p className="mt-1 text-tinta/65">Referencia: {p.referencia}</p>}
          {p.telefono_publico && <p className="mt-1 text-tinta/65">Teléfono del punto: {p.telefono_publico}</p>}
        </section>
        <aside className="rounded-[2rem] bg-bosque p-7 text-papel">
          <p className="etiqueta text-brote">Horario</p>
          <p className="titular mt-2 text-4xl">
            {p.hora_apertura.slice(0, 5)} – {p.hora_cierre.slice(0, 5)}
          </p>
          <p className="mt-1 text-papel/75">{p.dias_atencion}</p>
          <p className="etiqueta mt-6 text-brote">Recibe</p>
          <ul className="mt-3 flex flex-col gap-2">
            {MATERIALES.filter((m) => p.materiales.includes(m.codigo)).map((m) => (
              <li key={m.codigo} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-[4px] ${m.color}`} aria-hidden="true" />
                <span>
                  <span className="font-semibold">{m.nombre}</span>
                  <span className="block text-xs text-papel/60">{m.detalle}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
