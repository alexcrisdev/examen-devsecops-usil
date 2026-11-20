"use client";

import { useActionState } from "react";
import { registrarse, type EstadoRegistro } from "@/features/registro/actions";

const campo = "rounded border px-3 py-2";

export function FormularioRegistro() {
  const [estado, accion, pendiente] = useActionState<EstadoRegistro, FormData>(registrarse, {});
  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Nombre o razón social
        <input name="nombre" required minLength={2} maxLength={120} autoComplete="name" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Correo
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña (mínimo 8 caracteres)
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className={campo}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Distrito
        <input name="distrito" required minLength={2} maxLength={80} placeholder="Ej. Surco" className={campo} />
      </label>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">¿Cómo usarás EcoGreen?</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo" value="hogar" required defaultChecked /> Hogar: quiero entregar mis reciclables
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo" value="negocio" /> Negocio: genero material reciclable
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo" value="recolector" /> Recolector / reciclador
        </label>
      </fieldset>
      <p className="text-xs opacity-70">
        Los recolectores quedan pendientes de verificación por el administrador antes de poder reservar recojos.
      </p>
      {estado.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}
      {estado.mensaje && (
        <p role="status" className="text-sm text-green-700">
          {estado.mensaje}
        </p>
      )}
      <button disabled={pendiente} className="rounded bg-green-700 px-3 py-2 text-white disabled:opacity-50">
        {pendiente ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
