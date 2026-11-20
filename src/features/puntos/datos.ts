import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatosPunto, PuntoPublico } from "./validacion";

const COLUMNAS =
  "id, nombre, direccion, distrito, referencia, dias_atencion, hora_apertura, hora_cierre, telefono_publico, punto_materiales(material_codigo)";

type FilaPunto = Omit<PuntoPublico, "materiales"> & { punto_materiales: { material_codigo: string }[] };

const aPunto = (f: FilaPunto): PuntoPublico => {
  const { punto_materiales, ...resto } = f;
  return { ...resto, materiales: punto_materiales.map((m) => m.material_codigo) };
};

export async function obtenerMiPunto(supabase: SupabaseClient, adminId: string) {
  const { data } = await supabase.from("puntos_acopio").select(COLUMNAS).eq("admin_id", adminId).maybeSingle();
  return data ? aPunto(data as FilaPunto) : null;
}

// Crea o actualiza el punto del admin de acopio. RLS solo deja tocar el propio.
export async function guardarMiPunto(supabase: SupabaseClient, adminId: string, datos: DatosPunto) {
  const { materiales, ...campos } = datos;
  const existente = await obtenerMiPunto(supabase, adminId);

  let puntoId = existente?.id;
  if (puntoId) {
    const { error } = await supabase
      .from("puntos_acopio")
      .update({ ...campos, actualizado_en: new Date().toISOString() })
      .eq("id", puntoId)
      .eq("admin_id", adminId);
    if (error) return null;
  } else {
    const { data, error } = await supabase
      .from("puntos_acopio")
      .insert({ ...campos, admin_id: adminId })
      .select("id")
      .single();
    if (error || !data) return null;
    puntoId = data.id as string;
  }

  const { error: errBorrar } = await supabase.from("punto_materiales").delete().eq("punto_id", puntoId);
  if (errBorrar) return null;
  const { error: errMat } = await supabase
    .from("punto_materiales")
    .insert(materiales.map((m) => ({ punto_id: puntoId, material_codigo: m })));
  if (errMat) return null;

  return { id: puntoId, creado: !existente };
}

// Directorio público (RLS: solo puntos activos para anónimos).
export async function listarPuntosPublicos(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("puntos_acopio")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("nombre")
    .limit(300);
  return ((data ?? []) as FilaPunto[]).map(aPunto);
}

export async function obtenerPuntoPublico(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("puntos_acopio").select(COLUMNAS).eq("id", id).eq("activo", true).maybeSingle();
  return data ? aPunto(data as FilaPunto) : null;
}
