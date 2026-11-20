import { ROLES, tienePermiso, type Rol } from "@/lib/roles";

// Única fuente de verdad: qué roles entran a cada sección privada de EcoGreen.
// Las páginas usan rolesPara() con exigirRol() y el menú se arma con menuPara().
const SECCIONES: { prefijo: string; roles: readonly Rol[] }[] = [
  { prefijo: "/panel", roles: ROLES },
  { prefijo: "/puntos", roles: ROLES }, // público; en el menú para usuarios con sesión
  { prefijo: "/publicaciones", roles: ["generador"] },
  { prefijo: "/recolector", roles: ["recolector"] },
  { prefijo: "/acopio", roles: ["admin_acopio"] },
  { prefijo: "/admin", roles: ["admin"] },
];

type ItemMenu = { href: string; texto: string };

const MENU: (ItemMenu & { roles: readonly Rol[] })[] = [
  { href: "/panel", texto: "Inicio", roles: ROLES },
  { href: "/puntos", texto: "Puntos de acopio", roles: ["generador"] },
  { href: "/publicaciones", texto: "Mis publicaciones", roles: ["generador"] },
  { href: "/recolector", texto: "Material disponible", roles: ["recolector"] },
  { href: "/acopio", texto: "Mi punto de acopio", roles: ["admin_acopio"] },
  { href: "/admin/usuarios", texto: "Usuarios", roles: ["admin"] },
  { href: "/admin/auditoria", texto: "Auditoría", roles: ["admin"] },
];

function seccionDe(ruta: string) {
  return SECCIONES.find((s) => ruta === s.prefijo || ruta.startsWith(s.prefijo + "/"));
}

// Roles permitidos para una ruta. Ruta desconocida = nadie (denegar por defecto).
export function rolesPara(ruta: string): Rol[] {
  return [...(seccionDe(ruta)?.roles ?? [])];
}

export function rutaPermitida(ruta: string, rol: unknown): boolean {
  return tienePermiso(rol, rolesPara(ruta));
}

export function menuPara(rol: Rol): ItemMenu[] {
  return MENU.filter((i) => i.roles.includes(rol)).map(({ href, texto }) => ({ href, texto }));
}
