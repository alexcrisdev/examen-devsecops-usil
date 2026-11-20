import "server-only";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { MetadataRegistro } from "./validacion";

// Única capa que habla con Supabase para el registro.
export async function crearCuenta(email: string, password: string, metadata: MetadataRegistro) {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  return { ok: !error, conSesion: Boolean(data.session) };
}
