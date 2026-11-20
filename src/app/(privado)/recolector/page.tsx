import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { MATERIALES } from "@/lib/materiales";
import { estaVerificado, misRecojos, publicacionesDisponibles } from "@/features/publicaciones/datos";
import { accionPublicacion } from "@/features/publicaciones/actions";
import { esquemaFiltroDisponibles } from "@/features/publicaciones/validacion";
import { calificacionesDe } from "@/features/impacto/datos";
import { promedio } from "@/features/impacto/validacion";
import { filtrarPuntos } from "@/features/puntos/validacion";
import { TarjetaPublicacion } from "@/components/tarjeta-publicacion";

const AVISOS: Record<string, { texto: string; ok: boolean }> = {
  reservar: { texto: "¡Reservado! Ya puedes ver la dirección exacta en Mis recojos.", ok: true },
  recoger: { texto: "Recojo confirmado. ¡Gracias por reciclar!", ok: true },
  liberar: { texto: "Reserva liberada; el aviso vuelve a estar disponible.", ok: true },
  "no-disponible": { texto: "Otro recolector ya reservó este aviso.", ok: false },
  error: { texto: "No tienes permiso para esa acción o no se pudo completar.", ok: false },
};

function Boton({ id, accion, texto, primario }: { id: string; accion: string; texto: string; primario?: boolean }) {
  return (
    <form action={accionPublicacion}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="accion" value={accion} />
      <button className={`boton ${primario ? "boton-primario" : "boton-secundario"} px-4 py-2 text-sm`}>{texto}</button>
    </form>
  );
}

export default async function PaginaRecolector({ searchParams }: PageProps<"/recolector">) {
  const { supabase, user } = await exigirRol(rolesPara("/recolector"));
  const params = await searchParams;
  const filtro = esquemaFiltroDisponibles.parse({ material: params.material, distrito: params.distrito });
  const aviso = typeof params.aviso === "string" ? AVISOS[params.aviso] : undefined;

  const verificado = await estaVerificado(supabase, user.id);
  const [disponibles, recojos] = verificado
    ? await Promise.all([publicacionesDisponibles(supabase), misRecojos(supabase, user.id)])
    : [[], []];
  const prom = promedio((await calificacionesDe(supabase, "recolector_id", user.id)).map((c) => c.puntaje));
  const lista = filtrarPuntos(
    disponibles.map((p) => ({ ...p, materiales: [p.material_codigo] })),
    filtro,
  );

  return (
    <>
      <p className="etiqueta text-musgo">Recolector</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular text-5xl text-bosque">Material disponible</h1>
        {prom !== null && (
          <p className="rounded-full bg-bosque px-4 py-2 text-sm text-papel">
            Tu calificación <strong className="text-brote">★ {prom}</strong>
          </p>
        )}
      </div>
      {aviso && (
        <p
          role={aviso.ok ? "status" : "alert"}
          className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
            aviso.ok ? "border-hoja/30 bg-brote/40 text-bosque" : "border-alerta/30 bg-alerta/10 text-alerta"
          }`}
        >
          {aviso.texto}
        </p>
      )}

      {!verificado ? (
        <div className="mt-8 rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
          <p className="titular text-3xl text-hoja">Cuenta pendiente de verificación</p>
          <p className="mt-2 text-tinta/70">Un administrador de EcoGreen debe verificarte antes de que puedas ver y reservar recojos.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <section>
            <form method="get" className="grid gap-3 rounded-[1.5rem] bg-papel-2 p-4 sm:grid-cols-[1fr_1fr_auto]">
              <select name="material" defaultValue={filtro.material ?? ""} aria-label="Material" className="campo">
                <option value="">Todos los materiales</option>
                {MATERIALES.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <input name="distrito" maxLength={80} defaultValue={filtro.distrito ?? ""} placeholder="Distrito" aria-label="Distrito" className="campo" />
              <button className="boton boton-primario">Filtrar</button>
            </form>
            {lista.length === 0 ? (
              <p className="mt-4 rounded-[1.5rem] border-2 border-dashed border-linea p-8 text-center text-tinta/60">
                No hay material disponible con esos filtros.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    <div className="mt-4">
                      <Boton id={p.id} accion="reservar" texto="Reservar recojo" primario />
                    </div>
                  </TarjetaPublicacion>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="etiqueta text-musgo">Mis recojos ({recojos.length})</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {recojos.map((p) => (
                <TarjetaPublicacion
                  key={p.id}
                  material={p.material_codigo}
                  kg={p.cantidad_kg}
                  distrito={p.distrito}
                  referencia={p.referencia}
                  franja={`${p.franja_inicio.slice(0, 5)}–${p.franja_fin.slice(0, 5)}`}
                  estado={p.estado}
                >
                  {p.contacto && (
                    <div className="mt-3 rounded-xl bg-papel-2 p-3 text-sm">
                      <p>
                        <strong>{p.persona?.nombre}</strong> · {p.contacto.direccion}
                      </p>
                      {p.contacto.telefono && <p className="text-tinta/70">Tel. {p.contacto.telefono}</p>}
                    </div>
                  )}
                  {p.estado === "reservado" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Boton id={p.id} accion="recoger" texto="Marcar recogido" primario />
                      <Boton id={p.id} accion="liberar" texto="Liberar" />
                    </div>
                  )}
                </TarjetaPublicacion>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
