import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { misPublicaciones } from "@/features/publicaciones/datos";
import { accionPublicacion } from "@/features/publicaciones/actions";
import { calificar } from "@/features/impacto/actions";
import { calificacionesDe } from "@/features/impacto/datos";
import { TarjetaPublicacion } from "@/components/tarjeta-publicacion";
import { FormularioPublicar } from "./formulario";

const AVISOS: Record<string, string> = {
  cancelar: "Publicación cancelada.",
  calificado: "¡Gracias! Tu calificación ayuda a otros vecinos.",
  error: "No se pudo completar la acción.",
};

export default async function PaginaPublicaciones({ searchParams }: PageProps<"/publicaciones">) {
  const { supabase, user } = await exigirRol(rolesPara("/publicaciones"));
  const { aviso } = await searchParams;
  const [lista, { data: perfil }, calificaciones] = await Promise.all([
    misPublicaciones(supabase, user.id),
    supabase.from("perfiles").select("distrito").eq("id", user.id).single(),
    calificacionesDe(supabase, "generador_id", user.id),
  ]);
  const puntajes = new Map(calificaciones.map((c) => [c.publicacion_id, c.puntaje]));

  return (
    <>
      <p className="etiqueta text-musgo">Generador</p>
      <h1 className="titular mt-3 text-5xl text-bosque">Mis publicaciones</h1>
      {typeof aviso === "string" && AVISOS[aviso] && (
        <p role="status" className="mt-6 rounded-2xl border border-linea bg-papel-2 px-5 py-4 text-sm">
          {AVISOS[aviso]}
        </p>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <FormularioPublicar distrito={perfil?.distrito ?? ""} />
        <section>
          <h2 className="etiqueta text-musgo">Tus avisos ({lista.length})</h2>
          {lista.length === 0 ? (
            <p className="mt-4 rounded-[1.5rem] border-2 border-dashed border-linea p-8 text-center text-tinta/60">
              Aún no publicas material.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {lista.map((p) => (
                <TarjetaPublicacion
                  key={p.id}
                  material={p.material_codigo}
                  kg={p.cantidad_kg}
                  distrito={p.distrito}
                  referencia={p.referencia}
                  franja={`${p.franja_inicio.slice(0, 5)}–${p.franja_fin.slice(0, 5)}`}
                  estado={p.estado}
                >
                  {p.persona && (
                    <p className="mt-2 text-sm">
                      Recolector: <strong>{p.persona.nombre}</strong>
                    </p>
                  )}
                  {p.estado === "recogido" &&
                    (puntajes.has(p.id) ? (
                      <p className="mt-2 text-sm text-hoja">Calificaste con {"★".repeat(puntajes.get(p.id) ?? 0)}</p>
                    ) : (
                      <form action={calificar} className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="publicacion_id" value={p.id} />
                        <fieldset className="flex flex-row-reverse justify-end" aria-label="Puntaje del recolector">
                          {[5, 4, 3, 2, 1].map((n) => (
                            <label key={n} className="cursor-pointer">
                              <input type="radio" name="puntaje" value={n} required className="peer sr-only" />
                              <span className="px-0.5 text-2xl text-linea peer-checked:text-mat-plastico" title={`${n} estrellas`}>★</span>
                            </label>
                          ))}
                        </fieldset>
                        <input name="comentario" maxLength={300} placeholder="Comentario (opcional)" className="campo flex-1 py-1.5 text-sm" />
                        <button className="boton boton-primario px-4 py-1.5 text-sm">Calificar</button>
                      </form>
                    ))}
                  {p.estado === "disponible" && (
                    <form action={accionPublicacion} className="mt-3">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="accion" value="cancelar" />
                      <button className="text-sm font-semibold text-alerta underline underline-offset-4">Cancelar aviso</button>
                    </form>
                  )}
                </TarjetaPublicacion>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
