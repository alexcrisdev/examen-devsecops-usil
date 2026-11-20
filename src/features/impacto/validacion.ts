import { z } from "zod";
import { MATERIALES, type CodigoMaterial } from "@/lib/materiales";

const CODIGOS = MATERIALES.map((m) => m.codigo) as [CodigoMaterial, ...CodigoMaterial[]];

// ---------- HU-11: entregas recibidas en el punto ----------
export const esquemaEntrega = z.object({
  material: z.enum(CODIGOS),
  kg: z.coerce
    .number()
    .gt(0)
    .lte(100000)
    .transform((n) => Math.round(n * 100) / 100),
});

// Regla: solo se registran materiales que el punto recibe (la BD lo exige con una FK compuesta).
export function materialPermitido(materialesDelPunto: string[], material: string) {
  return materialesDelPunto.includes(material);
}

// ---------- HU-12: indicadores de impacto ----------
type Entrega = { material_codigo: string; kg: number; fecha: string };
type Pub = { estado: string; recolector_id: string | null; cantidad_kg: number };
type Perfil = { rol: string; verificado: boolean };

export function calcularIndicadores(entregas: Entrega[], publicaciones: Pub[], perfiles: Perfil[]) {
  const kgPorMaterial = Object.fromEntries(MATERIALES.map((m) => [m.codigo, 0])) as Record<string, number>;
  const kgPorMes: Record<string, number> = {};
  for (const e of entregas) {
    const kg = Number(e.kg);
    kgPorMaterial[e.material_codigo] = (kgPorMaterial[e.material_codigo] ?? 0) + kg;
    const mes = e.fecha.slice(0, 7);
    kgPorMes[mes] = (kgPorMes[mes] ?? 0) + kg;
  }
  const recogidas = publicaciones.filter((p) => p.estado === "recogido");
  const redondear = (n: number) => Math.round(n * 100) / 100;

  return {
    kgTotal: redondear(entregas.reduce((s, e) => s + Number(e.kg), 0)),
    kgPorMaterial: Object.fromEntries(Object.entries(kgPorMaterial).map(([k, v]) => [k, redondear(v)])),
    kgPorMes: Object.fromEntries(
      Object.entries(kgPorMes)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([k, v]) => [k, redondear(v)]),
    ),
    recojosRealizados: recogidas.length,
    kgRecogidosEnRecojos: redondear(recogidas.reduce((s, p) => s + Number(p.cantidad_kg), 0)),
    publicacionesDisponibles: publicaciones.filter((p) => p.estado === "disponible").length,
    recolectoresVerificados: perfiles.filter((p) => p.rol === "recolector" && p.verificado).length,
    recolectoresActivos: new Set(recogidas.map((p) => p.recolector_id).filter(Boolean)).size,
  };
}

// ---------- HU-13: calificar al recolector ----------
export const esquemaCalificacion = z.object({
  publicacion_id: z.string().uuid(),
  puntaje: z.coerce.number().int().min(1).max(5),
  comentario: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => v || null),
});

export function puedeCalificar(
  pub: { estado: string; generador_id: string; recolector_id: string | null },
  usuarioId: string,
  yaCalificada: boolean,
) {
  return pub.estado === "recogido" && pub.generador_id === usuarioId && Boolean(pub.recolector_id) && !yaCalificada;
}

export function promedio(puntajes: number[]) {
  if (puntajes.length === 0) return null;
  return Math.round((puntajes.reduce((s, p) => s + p, 0) / puntajes.length) * 10) / 10;
}
