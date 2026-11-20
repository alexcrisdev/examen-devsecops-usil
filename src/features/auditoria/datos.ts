import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EventoAuditoria = {
  id: number;
  usuario_id: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  detalle: Record<string, unknown>;
  creado_en: string;
  usuario_nombre: string;
};

// RLS: solo el admin puede leer la auditoría.
export async function listarAuditoria(supabase: SupabaseClient, accion?: string): Promise<EventoAuditoria[]> {
  let consulta = supabase
    .from("auditoria")
    .select("id, usuario_id, accion, entidad, entidad_id, detalle, creado_en")
    .order("creado_en", { ascending: false })
    .limit(100);
  if (accion) consulta = consulta.eq("accion", accion);
  const { data } = await consulta;
  const eventos = data ?? [];

  const ids = [...new Set(eventos.map((e) => e.usuario_id).filter(Boolean))] as string[];
  const { data: perfiles } = ids.length
    ? await supabase.from("perfiles").select("id, nombre").in("id", ids)
    : { data: [] as { id: string; nombre: string }[] };
  const nombres = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));

  return eventos.map((e) => ({ ...e, usuario_nombre: nombres.get(e.usuario_id ?? "") ?? "—" })) as EventoAuditoria[];
}
