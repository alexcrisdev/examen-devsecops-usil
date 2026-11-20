"use client";

import { useActionState } from "react";
import { publicar, type EstadoPublicar } from "@/features/publicaciones/actions";
import { MATERIALES } from "@/lib/materiales";

export function FormularioPublicar({ distrito }: { distrito: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoPublicar, FormData>(publicar, {});
  return (
    <form action={accion} className="grid gap-4 rounded-[2rem] bg-bosque p-6 text-papel sm:grid-cols-2 md:p-8">
      <p className="titular text-3xl sm:col-span-2">
        Publica tu <em className="text-brote">material</em>
      </p>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Material
        <select name="material" required className="campo">
          {MATERIALES.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Cantidad aproximada (kg)
        <input name="cantidad_kg" type="number" step="0.5" min="0.5" max="10000" required defaultValue="5" className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Distrito
        <input name="distrito" required minLength={2} maxLength={80} defaultValue={distrito} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Referencia pública (opcional)
        <input name="referencia" maxLength={200} placeholder="Cerca al parque Kennedy" className="campo" />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:col-span-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Desde
          <input name="franja_inicio" type="time" required defaultValue="09:00" className="campo" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Hasta
          <input name="franja_fin" type="time" required defaultValue="12:00" className="campo" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Dirección exacta (privada)
        <input name="direccion" required minLength={5} maxLength={200} className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Teléfono (opcional, privado)
        <input name="telefono" maxLength={20} className="campo" />
      </label>
      <p className="text-xs text-papel/70 sm:col-span-2">
        Tu dirección y teléfono solo los verá el recolector que reserve este aviso (Ley N.° 29733).
      </p>
      {estado.error && (
        <p role="alert" className="rounded-xl bg-alerta/90 px-4 py-3 text-sm text-white sm:col-span-2">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="rounded-xl bg-brote px-4 py-3 text-sm text-bosque sm:col-span-2">
          {estado.ok}
        </p>
      )}
      <div className="sm:col-span-2">
        <button disabled={pendiente} className="boton bg-brote text-bosque hover:bg-papel disabled:opacity-50">
          {pendiente ? "Publicando..." : "Publicar material"}
        </button>
      </div>
    </form>
  );
}
