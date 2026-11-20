import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { listarAuditoria } from "@/features/auditoria/datos";
import { ACCIONES, describirAccion, esquemaFiltroAuditoria } from "@/features/auditoria/validacion";

const fecha = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", dateStyle: "short", timeStyle: "short" });

export default async function PaginaAuditoria({ searchParams }: PageProps<"/admin/auditoria">) {
  const { supabase } = await exigirRol(rolesPara("/admin/auditoria"));
  const filtro = esquemaFiltroAuditoria.parse({ accion: (await searchParams).accion });
  const eventos = await listarAuditoria(supabase, filtro.accion);

  return (
    <>
      <p className="etiqueta text-musgo">Administración</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular text-5xl text-bosque">Auditoría</h1>
        <form method="get" className="flex items-end gap-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Acción
            <select name="accion" defaultValue={filtro.accion ?? ""} className="campo py-2 text-sm">
              <option value="">Todas</option>
              {Object.entries(ACCIONES).map(([clave, texto]) => (
                <option key={clave} value={clave}>
                  {texto}
                </option>
              ))}
            </select>
          </label>
          <button className="boton boton-secundario px-4 py-2 text-sm">Filtrar</button>
        </form>
      </div>
      <p className="mt-3 text-sm text-tinta/65">
        Últimos 100 eventos, del más reciente al más antiguo. Este registro no se puede editar ni borrar.
      </p>

      {eventos.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
          <p className="titular text-3xl text-hoja">Sin eventos</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-linea bg-[#fffdf6]">
          <table className="w-full text-left text-sm">
            <thead className="etiqueta bg-papel-2 text-[0.62rem] text-musgo">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-t border-linea/70 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{fecha.format(new Date(e.creado_en))}</td>
                  <td className="px-4 py-3">{e.usuario_nombre}</td>
                  <td className="px-4 py-3 font-medium">{describirAccion(e.accion)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-tinta/60">
                    {e.entidad}
                    {e.entidad_id ? ` · ${e.entidad_id.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-tinta/60">
                    {Object.keys(e.detalle ?? {}).length ? JSON.stringify(e.detalle) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
