"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { actualizarRol, marcarVerificado, obtenerPerfil } from "./datos";
import { esquemaCambiarRol, esquemaIdUsuario, puedeCambiarRol, puedeVerificar } from "./validacion";

const RUTA = "/admin/usuarios";

export async function aprobarRecolector(formData: FormData) {
  const { supabase, user } = await exigirRol(["admin"]);
  const datos = esquemaIdUsuario.safeParse({ id: formData.get("id") });
  if (!datos.success) redirect(`${RUTA}?aviso=error`);

  const objetivo = await obtenerPerfil(supabase, datos.data.id);
  if (!objetivo || !puedeVerificar(objetivo)) redirect(`${RUTA}?aviso=error`);

  const ok = await marcarVerificado(supabase, datos.data.id);
  if (!ok) redirect(`${RUTA}?aviso=error`);

  await registrarAuditoria(supabase, {
    usuarioId: user.id,
    accion: "verificar_recolector",
    entidad: "perfiles",
    entidadId: datos.data.id,
  });
  revalidatePath(RUTA);
  redirect(`${RUTA}?aviso=verificado`);
}

export async function cambiarRol(formData: FormData) {
  const { supabase, user } = await exigirRol(["admin"]);
  const datos = esquemaCambiarRol.safeParse({ id: formData.get("id"), rol: formData.get("rol") });
  if (!datos.success || !puedeCambiarRol(user.id, datos.data.id)) redirect(`${RUTA}?aviso=error`);

  const anterior = await obtenerPerfil(supabase, datos.data.id);
  if (!anterior) redirect(`${RUTA}?aviso=error`);
  if (anterior.rol === datos.data.rol) redirect(RUTA);

  const ok = await actualizarRol(supabase, datos.data.id, datos.data.rol);
  if (!ok) redirect(`${RUTA}?aviso=error`);

  await registrarAuditoria(supabase, {
    usuarioId: user.id,
    accion: "cambiar_rol",
    entidad: "perfiles",
    entidadId: datos.data.id,
    detalle: { de: anterior.rol, a: datos.data.rol },
  });
  revalidatePath(RUTA);
  redirect(`${RUTA}?aviso=rol-actualizado`);
}
