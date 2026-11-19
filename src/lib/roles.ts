// Roles del sistema. AJUSTAR al caso del examen (y al CHECK de la migración de perfiles).
export const ROLES = ["admin", "usuario"] as const;
export type Rol = (typeof ROLES)[number];

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}

export function tienePermiso(rol: unknown, permitidos: readonly Rol[]): boolean {
  return esRol(rol) && permitidos.includes(rol);
}
