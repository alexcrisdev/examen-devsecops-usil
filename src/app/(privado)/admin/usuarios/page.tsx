import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { NOMBRE_ROL, ROLES } from "@/lib/roles";
import { listarPerfiles } from "@/features/usuarios/datos";
import { aprobarRecolector, cambiarRol } from "@/features/usuarios/actions";
import { esPendiente, esquemaFiltroUsuarios, filtrarUsuarios } from "@/features/usuarios/validacion";

const AVISOS: Record<string, { texto: string; ok: boolean }> = {
  verificado: { texto: "Recolector verificado. Ya puede reservar recojos.", ok: true },
  "rol-actualizado": { texto: "Rol actualizado correctamente.", ok: true },
  error: { texto: "No se pudo completar la acción. Inténtalo nuevamente.", ok: false },
};

export default async function PaginaUsuarios({ searchParams }: PageProps<"/admin/usuarios">) {
  const { supabase, user } = await exigirRol(rolesPara("/admin/usuarios"));
  const params = await searchParams;
  const filtro = esquemaFiltroUsuarios.parse(params.filtro);
  const aviso = typeof params.aviso === "string" ? AVISOS[params.aviso] : undefined;

  const todos = await listarPerfiles(supabase);
  const lista = filtrarUsuarios(todos, filtro);
  const pendientes = todos.filter(esPendiente).length;

  return (
    <>
      <p className="etiqueta text-musgo">Administración</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular text-5xl text-bosque">Usuarios de EcoGreen</h1>
        <div className="flex gap-2" role="tablist" aria-label="Filtro de usuarios">
          {(
            [
              ["todos", `Todos (${todos.length})`],
              ["pendientes", `Recolectores pendientes (${pendientes})`],
            ] as const
          ).map(([valor, texto]) => (
            <Link
              key={valor}
              href={valor === "todos" ? "/admin/usuarios" : "/admin/usuarios?filtro=pendientes"}
              role="tab"
              aria-selected={filtro === valor}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                filtro === valor ? "border-bosque bg-bosque text-brote" : "border-tinta/20 hover:border-tinta"
              }`}
            >
              {texto}
            </Link>
          ))}
        </div>
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

      {lista.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
          <p className="titular text-3xl text-hoja">Todo al día</p>
          <p className="mt-2 text-tinta/70">No hay recolectores pendientes de verificación.</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {lista.map((p) => {
            const esYo = p.id === user.id;
            return (
              <li
                key={p.id}
                className="grid items-center gap-4 rounded-[1.5rem] border border-linea bg-[#fffdf6] p-5 md:grid-cols-[1.4fr_1fr_auto]"
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {p.nombre}
                    {esYo && <span className="etiqueta rounded-full bg-papel-2 px-2 py-0.5 text-[0.6rem]">Tú</span>}
                    {esPendiente(p) && (
                      <span className="etiqueta rounded-full bg-mat-plastico/30 px-2 py-0.5 text-[0.6rem] text-tinta">
                        Pendiente
                      </span>
                    )}
                    {p.rol === "recolector" && p.verificado && (
                      <span className="etiqueta rounded-full bg-brote px-2 py-0.5 text-[0.6rem] text-bosque">
                        Verificado ✓
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-tinta/65">
                    {NOMBRE_ROL[p.rol]}
                    {p.tipo_generador ? ` · ${p.tipo_generador}` : ""}
                    {p.distrito ? ` · ${p.distrito}` : ""}
                  </p>
                </div>

                <form action={cambiarRol} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <label className="sr-only" htmlFor={`rol-${p.id}`}>
                    Rol de {p.nombre}
                  </label>
                  <select
                    id={`rol-${p.id}`}
                    name="rol"
                    defaultValue={p.rol}
                    disabled={esYo}
                    className="campo py-2 text-sm disabled:opacity-60"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {NOMBRE_ROL[r]}
                      </option>
                    ))}
                  </select>
                  <button disabled={esYo} className="boton boton-secundario px-3 py-2 text-sm disabled:opacity-40">
                    Guardar
                  </button>
                </form>

                <div className="md:text-right">
                  {esPendiente(p) ? (
                    <form action={aprobarRecolector}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="boton boton-primario px-4 py-2 text-sm">Verificar recolector</button>
                    </form>
                  ) : (
                    <span className="text-xs text-tinta/40">—</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-tinta/55">
        Cada verificación y cambio de rol queda registrado en la auditoría de EcoGreen.
      </p>
    </>
  );
}
