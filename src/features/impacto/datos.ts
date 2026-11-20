import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------- HU-11 ----------
export async function entregasDelPunto(supabase: SupabaseClient, puntoId: string) {
  const { data } = await supabase
    .from("entregas")
    .select("id, material_codigo, kg, fecha, creado_en")
    .eq("punto_id", puntoId)
    .order("creado_en", { ascending: false })
    .limit(50);
  return (data ?? []) as { id: string; material_codigo: string; kg: number; fecha: string; creado_en: string }[];
}

// RLS: solo el admin de acopio dueño del punto; FK compuesta: solo materiales del punto.
export async function insertarEntrega(
  supabase: SupabaseClient,
  e: { punto_id: string; material_codigo: string; kg: number; registrado_por: string },
) {
  const { data, error } = await supabase.from("entregas").insert(e).select("id").single();
  return error || !data ? null : (data.id as string);
}

// ---------- HU-12 (RLS: el admin lee todo) ----------
export async function datosIndicadores(supabase: SupabaseClient) {
  const [entregas, publicaciones, perfiles] = await Promise.all([
    supabase.from("entregas").select("material_codigo, kg, fecha").limit(5000),
    supabase.from("publicaciones").select("estado, recolector_id, cantidad_kg").limit(5000),
    supabase.from("perfiles").select("rol, verificado").limit(5000),
  ]);
  return {
    entregas: (entregas.data ?? []) as { material_codigo: string; kg: number; fecha: string }[],
    publicaciones: (publicaciones.data ?? []) as { estado: string; recolector_id: string | null; cantidad_kg: number }[],
    perfiles: (perfiles.data ?? []) as { rol: string; verificado: boolean }[],
  };
}

// ---------- HU-13 ----------
export async function publicacionParaCalificar(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("publicaciones")
    .select("id, estado, generador_id, recolector_id")
    .eq("id", id)
    .maybeSingle();
  return data as { id: string; estado: string; generador_id: string; recolector_id: string | null } | null;
}

export async function calificacionesDe(supabase: SupabaseClient, columna: "generador_id" | "recolector_id", id: string) {
  const { data } = await supabase.from("calificaciones").select("publicacion_id, puntaje").eq(columna, id).limit(500);
  return (data ?? []) as { publicacion_id: string; puntaje: number }[];
}

// RLS: solo el generador dueño de un recojo "recogido"; publicacion_id único (no se califica dos veces).
export async function insertarCalificacion(
  supabase: SupabaseClient,
  c: { publicacion_id: string; generador_id: string; recolector_id: string; puntaje: number; comentario: string | null },
) {
  const { error } = await supabase.from("calificaciones").insert(c);
  return !error;
}
