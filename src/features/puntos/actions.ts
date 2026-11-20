"use server";

import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { guardarMiPunto } from "./datos";
import { esquemaPunto } from "./validacion";

export type EstadoPunto = { error?: string; ok?: string };

export async function guardarPunto(_previo: EstadoPunto, formData: FormData): Promise<EstadoPunto> {
  const { supabase, user } = await exigirRol(["admin_acopio"]);
  const datos = esquemaPunto.safeParse({
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    distrito: formData.get("distrito"),
    referencia: formData.get("referencia") ?? undefined,
    dias_atencion: formData.get("dias_atencion"),
    hora_apertura: formData.get("hora_apertura"),
    hora_cierre: formData.get("hora_cierre"),
    telefono_publico: formData.get("telefono_publico") ?? undefined,
    materiales: formData.getAll("materiales"),
  });
  if (!datos.success) {
    return { error: "Revisa los datos: elige al menos un material y una hora de cierre posterior a la apertura." };
  }

  const r = await guardarMiPunto(supabase, user.id, datos.data);
  if (!r) return { error: "No se pudo guardar el punto. Inténtalo nuevamente." };

  await registrarAuditoria(supabase, {
    usuarioId: user.id,
    accion: r.creado ? "crear_punto" : "editar_punto",
    entidad: "puntos_acopio",
    entidadId: r.id,
  });
  revalidatePath("/acopio");
  revalidatePath("/puntos");
  return { ok: r.creado ? "Punto de acopio publicado." : "Cambios guardados." };
}
