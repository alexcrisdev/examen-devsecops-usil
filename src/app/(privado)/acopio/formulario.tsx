"use client";

import { useActionState } from "react";
import { guardarPunto, type EstadoPunto } from "@/features/puntos/actions";
import type { PuntoPublico } from "@/features/puntos/validacion";
import { MATERIALES } from "@/lib/materiales";

export function FormularioPunto({ punto }: { punto: PuntoPublico | null }) {
  const [estado, accion, pendiente] = useActionState<EstadoPunto, FormData>(guardarPunto, {});
  const h = (t?: string) => t?.slice(0, 5);
  return (
    <form action={accion} className="grid gap-4 rounded-[2rem] border border-linea bg-[#fffdf6] p-6 md:grid-cols-2 md:p-8">
      <label className="flex flex-col gap-1.5 text-sm font-medium md:col-span-2">
        Nombre del punto
        <input name="nombre" required minLength={3} maxLength={120} defaultValue={punto?.nombre} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Dirección
        <input name="direccion" required minLength={5} maxLength={200} defaultValue={punto?.direccion} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Distrito
        <input name="distrito" required minLength={2} maxLength={80} defaultValue={punto?.distrito} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Referencia (opcional)
        <input name="referencia" maxLength={200} defaultValue={punto?.referencia ?? ""} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Teléfono público (opcional)
        <input name="telefono_publico" maxLength={20} defaultValue={punto?.telefono_publico ?? ""} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Días de atención
        <input
          name="dias_atencion"
          required
          minLength={3}
          maxLength={60}
          placeholder="Lun a Sáb"
          defaultValue={punto?.dias_atencion}
          className="campo"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Abre
          <input name="hora_apertura" type="time" required defaultValue={h(punto?.hora_apertura) ?? "08:00"} className="campo" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Cierra
          <input name="hora_cierre" type="time" required defaultValue={h(punto?.hora_cierre) ?? "17:00"} className="campo" />
        </label>
      </div>
      <fieldset className="md:col-span-2">
        <legend className="mb-2 text-sm font-medium">Materiales que recibes</legend>
        <div className="flex flex-wrap gap-2">
          {MATERIALES.map((m) => (
            <label key={m.codigo} className="cursor-pointer">
              <input
                type="checkbox"
                name="materiales"
                value={m.codigo}
                defaultChecked={punto?.materiales.includes(m.codigo)}
                className="peer sr-only"
              />
              <span className="flex items-center gap-2 rounded-full border-[1.5px] border-linea px-4 py-2 text-sm transition peer-checked:border-bosque peer-checked:bg-bosque peer-checked:text-papel peer-focus-visible:ring-4 peer-focus-visible:ring-brote/70">
                <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} aria-hidden="true" />
                {m.nombre}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {estado.error && (
        <p role="alert" className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm text-alerta md:col-span-2">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="rounded-xl border border-hoja/30 bg-brote/40 px-4 py-3 text-sm text-bosque md:col-span-2">
          {estado.ok}
        </p>
      )}
      <div className="md:col-span-2">
        <button disabled={pendiente} className="boton boton-primario">
          {pendiente ? "Guardando..." : punto ? "Guardar cambios" : "Publicar mi punto"}
        </button>
      </div>
    </form>
  );
}
