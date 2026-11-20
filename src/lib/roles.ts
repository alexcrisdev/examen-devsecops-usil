// Roles de EcoGreen. Deben coincidir con el CHECK perfiles_rol_check
// (supabase/migrations/20261120023433_ecogreen_modelo.sql).
export const ROLES = ["generador", "recolector", "admin_acopio", "admin"] as const;
export type Rol = (typeof ROLES)[number];

// Roles que una persona puede elegir al registrarse. Los administrativos solo los asigna el admin.
export const ROLES_REGISTRO = ["generador", "recolector"] as const;

export const NOMBRE_ROL: Record<Rol, string> = {
  generador: "Ciudadano generador",
  recolector: "Recolector / reciclador",
  admin_acopio: "Administrador de punto de acopio",
  admin: "Administrador de la plataforma",
};

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}

export function tienePermiso(rol: unknown, permitidos: readonly Rol[]): boolean {
  return esRol(rol) && permitidos.includes(rol);
}
