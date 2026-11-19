"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { esquemaLogin } from "./validacion";

export type EstadoLogin = { error?: string };

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const datos = esquemaLogin.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // Mensaje genérico: no revela si el correo existe (OWASP A07).
  if (!datos.success) return { error: "Correo o contraseña incorrectos" };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword(datos.data);
  if (error) return { error: "Correo o contraseña incorrectos" };

  redirect("/panel");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
