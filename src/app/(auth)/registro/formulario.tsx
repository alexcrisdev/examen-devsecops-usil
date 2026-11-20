"use client";

import { useActionState } from "react";
import { registrarse, type EstadoRegistro } from "@/features/registro/actions";

const tipos = [
  { valor: "hogar", titulo: "Hogar", texto: "Separo reciclables en casa", icono: "⌂" },
  { valor: "negocio", titulo: "Negocio", texto: "Mi local genera material", icono: "▤" },
  { valor: "recolector", titulo: "Recolector", texto: "Recojo y llevo a acopio", icono: "↻" },
] as const;

export function FormularioRegistro() {
  const [estado, accion, pendiente] = useActionState<EstadoRegistro, FormData>(registrarse, {});
  return (
    <form action={accion} className="flex w-full flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">¿Cómo usarás EcoGreen?</legend>
        <div className="grid grid-cols-3 gap-2">
          {tipos.map((t, i) => (
            <label key={t.valor} className="group cursor-pointer">
              <input type="radio" name="tipo" value={t.valor} required defaultChecked={i === 0} className="peer sr-only" />
              <span className="flex h-full flex-col rounded-2xl border-[1.5px] border-linea bg-[#fffdf6] p-3 transition peer-checked:border-bosque peer-checked:bg-bosque peer-checked:text-papel peer-focus-visible:ring-4 peer-focus-visible:ring-brote/70">
                <span className="titular text-2xl text-hoja group-has-checked:text-brote" aria-hidden="true">
                  {t.icono}
                </span>
                <span className="mt-2 text-sm font-semibold">{t.titulo}</span>
                <span className="text-xs leading-snug opacity-70">{t.texto}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Nombre o razón social
        <input name="nombre" required minLength={2} maxLength={120} autoComplete="name" className="campo" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Correo
          <input name="email" type="email" required maxLength={254} autoComplete="email" className="campo" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Distrito
          <input name="distrito" required minLength={2} maxLength={80} placeholder="Ej. Surco" className="campo" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="campo"
        />
      </label>

      <p className="rounded-xl bg-papel-2 px-4 py-3 text-xs leading-relaxed text-tinta/75">
        Si eres recolector, tu cuenta queda <strong>pendiente de verificación</strong> hasta que un administrador la
        apruebe. Tu dirección nunca se muestra públicamente (Ley N.° 29733).
      </p>

      {estado.error && (
        <p role="alert" className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm text-alerta">
          {estado.error}
        </p>
      )}
      {estado.mensaje && (
        <p role="status" className="rounded-xl border border-hoja/30 bg-brote/40 px-4 py-3 text-sm text-bosque">
          {estado.mensaje}
        </p>
      )}
      <button disabled={pendiente} className="boton boton-primario mt-1 w-full">
        {pendiente ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
