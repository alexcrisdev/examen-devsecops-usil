import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Rol } from "@/lib/roles";
import type { PerfilListado } from "./validacion";

// Única capa que habla con Supabase para la gestión de usuarios.
// Usa el cliente con la sesión del admin: RLS sigue aplicando (solo admin lee/edita todos).

export async function listarPerfiles(supabase: SupabaseClient): Promise<PerfilListado[]> {
  const { data } = await supabase
    .from("perfiles")
    .select("id, nombre, rol, verificado, distrito, tipo_generador, creado_en")
    .order("creado_en", { ascending: false })
    .limit(200);
  return (data ?? []) as PerfilListado[];
}

export async function obtenerPerfil(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("perfiles").select("id, rol, verificado").eq("id", id).maybeSingle();
  return data as Pick<PerfilListado, "id" | "rol" | "verificado"> | null;
}

// Update condicional: solo cambia si sigue siendo recolector pendiente.
export async function marcarVerificado(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("perfiles")
    .update({ verificado: true })
    .eq("id", id)
    .eq("rol", "recolector")
    .eq("verificado", false)
    .select("id");
  return !error && (data?.length ?? 0) === 1;
}

export async function actualizarRol(supabase: SupabaseClient, id: string, rol: Rol) {
  const { data, error } = await supabase.from("perfiles").update({ rol }).eq("id", id).select("id");
  return !error && (data?.length ?? 0) === 1;
}
