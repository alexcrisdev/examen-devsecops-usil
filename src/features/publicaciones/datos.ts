import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccionPublicacion, DatosPublicacion, Estado } from "./validacion";

export type Publicacion = {
  id: string;
  material_codigo: string;
  cantidad_kg: number;
  distrito: string;
  referencia: string | null;
  fecha_disponible: string;
  franja_inicio: string;
  franja_fin: string;
  estado: Estado;
  creado_en: string;
  contacto?: { direccion: string; telefono: string | null } | null;
  persona?: { nombre: string } | null;
};

const BASE = "id, material_codigo, cantidad_kg, distrito, referencia, fecha_disponible, franja_inicio, franja_fin, estado, creado_en";

// HU-08: crea la publicación (RLS: dueño = sesión, estado disponible) y su contacto privado.
export async function crearPublicacion(supabase: SupabaseClient, generadorId: string, d: DatosPublicacion) {
  const { data, error } = await supabase
    .from("publicaciones")
    .insert({
      generador_id: generadorId,
      material_codigo: d.material,
      cantidad_kg: d.cantidad_kg,
      distrito: d.distrito,
      referencia: d.referencia,
      franja_inicio: d.franja_inicio,
      franja_fin: d.franja_fin,
    })
    .select("id")
    .single();
  if (error || !data) return null;

  const { error: errContacto } = await supabase
    .from("publicacion_contactos")
    .insert({ publicacion_id: data.id, direccion: d.direccion, telefono: d.telefono });
  if (errContacto) return null;
  return data.id as string;
}

export async function misPublicaciones(supabase: SupabaseClient, generadorId: string) {
  const { data } = await supabase
    .from("publicaciones")
    .select(`${BASE}, persona:perfiles!publicaciones_recolector_id_fkey(nombre)`)
    .eq("generador_id", generadorId)
    .order("creado_en", { ascending: false })
    .limit(50);
  return (data ?? []) as unknown as Publicacion[];
}

// HU-09: RLS solo devuelve disponibles a recolectores verificados; sin datos de contacto.
export async function publicacionesDisponibles(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("publicaciones")
    .select(BASE)
    .eq("estado", "disponible")
    .order("creado_en", { ascending: false })
    .limit(200);
  return (data ?? []) as Publicacion[];
}

// HU-10: recojos del recolector, con la dirección exacta (RLS de publicacion_contactos).
export async function misRecojos(supabase: SupabaseClient, recolectorId: string) {
  const { data } = await supabase
    .from("publicaciones")
    .select(
      `${BASE}, contacto:publicacion_contactos(direccion, telefono), persona:perfiles!publicaciones_generador_id_fkey(nombre)`,
    )
    .eq("recolector_id", recolectorId)
    .in("estado", ["reservado", "recogido"])
    .order("reservado_en", { ascending: false })
    .limit(50);
  return (data ?? []) as unknown as Publicacion[];
}

export async function estaVerificado(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("perfiles").select("verificado").eq("id", id).single();
  return Boolean(data?.verificado);
}

const FUNCION: Record<AccionPublicacion, string> = {
  reservar: "reservar_publicacion",
  recoger: "marcar_recogida",
  liberar: "liberar_publicacion",
  cancelar: "cancelar_publicacion",
};

// Las funciones de BD validan el rol, hacen el UPDATE condicional y registran auditoría.
export async function ejecutarAccion(supabase: SupabaseClient, accion: AccionPublicacion, id: string) {
  const { error } = await supabase.rpc(FUNCION[accion], { p_id: id });
  if (!error) return "ok" as const;
  return error.code === "P0002" ? ("no-disponible" as const) : ("error" as const);
}
