import { z } from "zod";

// Acciones sensibles que EcoGreen registra (HU-03, HU-04, HU-10).
export const ACCIONES = {
  verificar_recolector: "Verificó a un recolector",
  cambiar_rol: "Cambió un rol",
  crear_punto: "Creó un punto de acopio",
  editar_punto: "Editó un punto de acopio",
  registrar_entrega: "Registró una entrega en su punto",
  reservar: "Reservó una publicación",
  reserva_denegada: "Intento de reserva denegado",
  liberar: "Liberó una reserva",
  marcar_recogida: "Marcó un recojo como recogido",
  cancelar: "Canceló una publicación",
} as const;

export type Accion = keyof typeof ACCIONES;
const CLAVES = Object.keys(ACCIONES) as [Accion, ...Accion[]];

export const esquemaFiltroAuditoria = z.object({
  accion: z.enum(CLAVES).optional().catch(undefined),
});

export function describirAccion(accion: string) {
  return accion in ACCIONES ? ACCIONES[accion as Accion] : "Acción desconocida";
}
