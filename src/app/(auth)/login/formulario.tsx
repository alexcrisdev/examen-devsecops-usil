"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "@/features/auth/actions";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});
  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Correo
        <input name="email" type="email" required autoComplete="email" className="rounded border px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="rounded border px-3 py-2"
        />
      </label>
      {estado.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}
      <button disabled={pendiente} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
        {pendiente ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
