"use server";

import { redirect } from "next/navigation";
import { crearCuenta } from "./datos";
import { esquemaRegistro, metadataDeRegistro } from "./validacion";

export type EstadoRegistro = { error?: string; mensaje?: string };

// Acción pública: quien se registra aún no tiene sesión, por eso no usa exigirRol.
// El rol lo decide el servidor (metadataDeRegistro) y otra vez la BD (trigger).
export async function registrarse(_previo: EstadoRegistro, formData: FormData): Promise<EstadoRegistro> {
  const datos = esquemaRegistro.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    distrito: formData.get("distrito"),
    tipo: formData.get("tipo"),
  });
  if (!datos.success) {
    return { error: "Revisa los datos: completa todos los campos y usa una contraseña de 8 o más caracteres." };
  }

  const { ok, conSesion } = await crearCuenta(datos.data.email, datos.data.password, metadataDeRegistro(datos.data));
  // Mensaje genérico: no revela si el correo ya estaba registrado (OWASP A07).
  if (!ok) return { error: "No se pudo completar el registro. Inténtalo nuevamente." };

  if (conSesion) redirect("/panel");
  return { mensaje: "Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión." };
}
