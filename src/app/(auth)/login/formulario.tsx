"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "@/features/auth/actions";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});
  return (
    <form action={accion} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Correo
        <input name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" className="campo" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="campo"
        />
      </label>
      {estado.error && (
        <p role="alert" className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm text-alerta">
          {estado.error}
        </p>
      )}
      <button disabled={pendiente} className="boton boton-primario mt-2 w-full">
        {pendiente ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
