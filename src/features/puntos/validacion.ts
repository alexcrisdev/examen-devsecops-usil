import { z } from "zod";
import { MATERIALES, type CodigoMaterial } from "@/lib/materiales";

const CODIGOS = MATERIALES.map((m) => m.codigo) as [CodigoMaterial, ...CodigoMaterial[]];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

// HU-04: datos del punto de acopio (todo se valida en servidor).
export const esquemaPunto = z
  .object({
    nombre: z.string().trim().min(3).max(120),
    direccion: z.string().trim().min(5).max(200),
    distrito: z.string().trim().min(2).max(80),
    referencia: textoOpcional(200),
    dias_atencion: z.string().trim().min(3).max(60),
    hora_apertura: z.string().regex(HORA),
    hora_cierre: z.string().regex(HORA),
    telefono_publico: z
      .string()
      .trim()
      .regex(/^[0-9+ ]{6,20}$/)
      .optional()
      .or(z.literal("").transform(() => undefined))
      .transform((v) => v ?? null),
    materiales: z.array(z.enum(CODIGOS)).min(1).max(CODIGOS.length),
  })
  .refine((p) => p.hora_cierre > p.hora_apertura, { message: "El cierre debe ser después de la apertura", path: ["hora_cierre"] })
  .transform((p) => ({ ...p, materiales: [...new Set(p.materiales)] }));

export type DatosPunto = z.infer<typeof esquemaPunto>;

// HU-05: filtros de búsqueda desde la URL; valores inválidos se ignoran.
export const esquemaFiltroPuntos = z.object({
  material: z.enum(CODIGOS).optional().catch(undefined),
  distrito: z.string().trim().max(80).optional().catch(undefined),
});

export type PuntoPublico = {
  id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  referencia: string | null;
  dias_atencion: string;
  hora_apertura: string;
  hora_cierre: string;
  telefono_publico: string | null;
  materiales: string[];
};

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export function filtrarPuntos<T extends Pick<PuntoPublico, "distrito" | "materiales">>(
  puntos: T[],
  filtro: { material?: string; distrito?: string },
) {
  const distrito = filtro.distrito ? normalizar(filtro.distrito) : "";
  return puntos.filter(
    (p) =>
      (!filtro.material || p.materiales.includes(filtro.material)) &&
      (!distrito || normalizar(p.distrito).includes(distrito)),
  );
}

// HU-06: ¿está abierto ahora? Horas "HH:MM" o "HH:MM:SS" (formato de Postgres).
export function estaAbierto(apertura: string, cierre: string, ahora: string) {
  const h = (t: string) => t.slice(0, 5);
  return h(ahora) >= h(apertura) && h(ahora) < h(cierre);
}

export function horaLima(fecha: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(fecha);
}
