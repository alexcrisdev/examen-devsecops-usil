"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { obtenerMiPunto } from "@/features/puntos/datos";
import { calificacionesDe, insertarCalificacion, insertarEntrega, publicacionParaCalificar } from "./datos";
import { esquemaCalificacion, esquemaEntrega, materialPermitido, puedeCalificar } from "./validacion";

// HU-11: el admin de acopio registra una entrega en SU punto.
export async function registrarEntrega(formData: FormData) {
  const { supabase, user } = await exigirRol(["admin_acopio"]);
  const RUTA = "/acopio/entregas";
  const datos = esquemaEntrega.safeParse({ material: formData.get("material"), kg: formData.get("kg") });
  if (!datos.success) redirect(`${RUTA}?aviso=error`);

  const punto = await obtenerMiPunto(supabase, user.id);
  if (!punto || !materialPermitido(punto.materiales, datos.data.material)) redirect(`${RUTA}?aviso=material`);

  const id = await insertarEntrega(supabase, {
    punto_id: punto.id,
    material_codigo: datos.data.material,
    kg: datos.data.kg,
    registrado_por: user.id,
  });
  if (!id) redirect(`${RUTA}?aviso=error`);

  await registrarAuditoria(supabase, {
    usuarioId: user.id,
    accion: "registrar_entrega",
    entidad: "entregas",
    entidadId: id,
    detalle: { material: datos.data.material, kg: datos.data.kg },
  });
  revalidatePath(RUTA);
  redirect(`${RUTA}?aviso=ok`);
}

// HU-13: el generador califica al recolector de un recojo terminado.
export async function calificar(formData: FormData) {
  const { supabase, user } = await exigirRol(["generador"]);
  const RUTA = "/publicaciones";
  const datos = esquemaCalificacion.safeParse({
    publicacion_id: formData.get("publicacion_id"),
    puntaje: formData.get("puntaje"),
    comentario: formData.get("comentario") ?? undefined,
  });
  if (!datos.success) redirect(`${RUTA}?aviso=error`);

  const pub = await publicacionParaCalificar(supabase, datos.data.publicacion_id);
  const ya = (await calificacionesDe(supabase, "generador_id", user.id)).some(
    (c) => c.publicacion_id === datos.data.publicacion_id,
  );
  if (!pub || !puedeCalificar(pub, user.id, ya) || !pub.recolector_id) redirect(`${RUTA}?aviso=error`);

  const ok = await insertarCalificacion(supabase, {
    publicacion_id: pub.id,
    generador_id: user.id,
    recolector_id: pub.recolector_id,
    puntaje: datos.data.puntaje,
    comentario: datos.data.comentario,
  });
  if (!ok) redirect(`${RUTA}?aviso=error`);
  revalidatePath(RUTA);
  redirect(`${RUTA}?aviso=calificado`);
}
