import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Registro de acciones sensibles (OWASP A09). RLS exige usuario_id = auth.uid().
export async function registrarAuditoria(
  supabase: SupabaseClient,
  evento: { usuarioId: string; accion: string; entidad: string; entidadId?: string; detalle?: Record<string, unknown> },
) {
  await supabase.from("auditoria").insert({
    usuario_id: evento.usuarioId,
    accion: evento.accion,
    entidad: evento.entidad,
    entidad_id: evento.entidadId ?? null,
    detalle: evento.detalle ?? {},
  });
}
