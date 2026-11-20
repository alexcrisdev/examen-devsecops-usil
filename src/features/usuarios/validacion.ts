import { z } from "zod";
import { ROLES, type Rol } from "@/lib/roles";

export type PerfilListado = {
  id: string;
  nombre: string;
  rol: Rol;
  verificado: boolean;
  distrito: string | null;
  tipo_generador: "hogar" | "negocio" | null;
  creado_en: string;
};

export const FILTROS_USUARIOS = ["todos", "pendientes"] as const;
export type FiltroUsuarios = (typeof FILTROS_USUARIOS)[number];

// Filtro de la URL: cualquier valor desconocido se trata como "todos".
export const esquemaFiltroUsuarios = z.enum(FILTROS_USUARIOS).catch("todos");

export const esquemaIdUsuario = z.object({ id: z.string().uuid() });

export const esquemaCambiarRol = z.object({
  id: z.string().uuid(),
  rol: z.enum(ROLES),
});

export function esPendiente(p: Pick<PerfilListado, "rol" | "verificado">) {
  return p.rol === "recolector" && !p.verificado;
}

export function filtrarUsuarios<T extends Pick<PerfilListado, "rol" | "verificado">>(lista: T[], filtro: FiltroUsuarios) {
  return filtro === "pendientes" ? lista.filter(esPendiente) : lista;
}

// Regla de negocio: solo se verifica a un recolector que aún está pendiente.
export function puedeVerificar(p: Pick<PerfilListado, "rol" | "verificado">) {
  return esPendiente(p);
}

// Regla de seguridad: el admin no se cambia su propio rol (evita dejar EcoGreen sin admin).
export function puedeCambiarRol(idActor: string, idObjetivo: string) {
  return idActor !== idObjetivo;
}
