import "server-only";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { tienePermiso, type Rol } from "@/lib/roles";

// Llamar al inicio de CADA acción de servidor y página protegida (OWASP A01).
export async function exigirRol(permitidos: Rol[]) {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, rol")
    .eq("id", user.id)
    .single();

  if (!perfil || !tienePermiso(perfil.rol, permitidos)) redirect("/login?error=permiso");
  return { supabase, user, perfil: perfil as { id: string; nombre: string; rol: Rol } };
}
