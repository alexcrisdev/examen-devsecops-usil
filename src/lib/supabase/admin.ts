import "server-only";
import { createClient } from "@supabase/supabase-js";

// Clave secreta: SALTA RLS. Solo servidor y solo cuando no hay otra opción.
export function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveSecreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !claveSecreta) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, claveSecreta, { auth: { persistSession: false, autoRefreshToken: false } });
}
