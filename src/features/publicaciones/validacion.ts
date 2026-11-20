import { z } from "zod";
import { MATERIALES, type CodigoMaterial } from "@/lib/materiales";

const CODIGOS = MATERIALES.map((m) => m.codigo) as [CodigoMaterial, ...CodigoMaterial[]];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// HU-08: el generador publica material. Estado y dueño NO vienen del navegador.
export const esquemaPublicacion = z
  .object({
    material: z.enum(CODIGOS),
    cantidad_kg: z.coerce.number().gt(0).lte(10000),
    distrito: z.string().trim().min(2).max(80),
    referencia: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((v) => v || null),
    franja_inicio: z.string().regex(HORA),
    franja_fin: z.string().regex(HORA),
    direccion: z.string().trim().min(5).max(200),
    telefono: z
      .string()
      .trim()
      .regex(/^[0-9+ ]{6,20}$/)
      .optional()
      .or(z.literal("").transform(() => undefined))
      .transform((v) => v ?? null),
  })
  .refine((p) => p.franja_fin > p.franja_inicio, { path: ["franja_fin"] })
  .transform((p) => ({ ...p, cantidad_kg: Math.round(p.cantidad_kg * 100) / 100 }));

export type DatosPublicacion = z.infer<typeof esquemaPublicacion>;

// HU-10: máquina de estados (la BD aplica la misma regla en sus funciones).
export const ESTADOS = ["disponible", "reservado", "recogido", "cancelada"] as const;
export type Estado = (typeof ESTADOS)[number];

export const ACCIONES_PUBLICACION = {
  reservar: { desde: "disponible", hacia: "reservado", rol: "recolector" },
  recoger: { desde: "reservado", hacia: "recogido", rol: "recolector" },
  liberar: { desde: "reservado", hacia: "disponible", rol: "recolector" },
  cancelar: { desde: "disponible", hacia: "cancelada", rol: "generador" },
} as const;

export type AccionPublicacion = keyof typeof ACCIONES_PUBLICACION;

export function siguienteEstado(estado: Estado, accion: AccionPublicacion): Estado | null {
  const t = ACCIONES_PUBLICACION[accion];
  return t.desde === estado ? t.hacia : null;
}

export const esquemaAccionPublicacion = z.object({
  id: z.string().uuid(),
  accion: z.enum(Object.keys(ACCIONES_PUBLICACION) as [AccionPublicacion, ...AccionPublicacion[]]),
});

// HU-09: filtros del recolector.
export const esquemaFiltroDisponibles = z.object({
  material: z.enum(CODIGOS).optional().catch(undefined),
  distrito: z.string().trim().max(80).optional().catch(undefined),
});

export const NOMBRE_ESTADO: Record<Estado, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  recogido: "Recogido",
  cancelada: "Cancelada",
};
