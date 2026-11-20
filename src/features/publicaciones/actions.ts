"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth";
import { crearPublicacion, ejecutarAccion } from "./datos";
import { ACCIONES_PUBLICACION, esquemaAccionPublicacion, esquemaPublicacion } from "./validacion";

export type EstadoPublicar = { error?: string; ok?: string };

// HU-08
export async function publicar(_previo: EstadoPublicar, formData: FormData): Promise<EstadoPublicar> {
  const { supabase, user } = await exigirRol(["generador"]);
  const datos = esquemaPublicacion.safeParse({
    material: formData.get("material"),
    cantidad_kg: formData.get("cantidad_kg"),
    distrito: formData.get("distrito"),
    referencia: formData.get("referencia") ?? undefined,
    franja_inicio: formData.get("franja_inicio"),
    franja_fin: formData.get("franja_fin"),
    direccion: formData.get("direccion"),
    telefono: formData.get("telefono") ?? undefined,
  });
  if (!datos.success) {
    return { error: "Revisa los datos: cantidad mayor a 0, un material válido y una franja horaria correcta." };
  }
  const id = await crearPublicacion(supabase, user.id, datos.data);
  if (!id) return { error: "No se pudo publicar. Inténtalo nuevamente." };
  revalidatePath("/publicaciones");
  return { ok: "¡Publicado! Los recolectores verificados de tu zona ya pueden verlo." };
}

// HU-10: reservar, recoger, liberar (recolector) y cancelar (generador).
export async function accionPublicacion(formData: FormData) {
  const datos = esquemaAccionPublicacion.safeParse({ id: formData.get("id"), accion: formData.get("accion") });
  const destino = datos.success && ACCIONES_PUBLICACION[datos.data.accion].rol === "generador" ? "/publicaciones" : "/recolector";
  if (!datos.success) redirect(`${destino}?aviso=error`);

  const { supabase } = await exigirRol([ACCIONES_PUBLICACION[datos.data.accion].rol]);
  const r = await ejecutarAccion(supabase, datos.data.accion, datos.data.id);
  revalidatePath(destino);
  redirect(`${destino}?aviso=${r === "ok" ? datos.data.accion : r}`);
}
