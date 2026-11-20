import { describe, expect, it } from "vitest";
import {
  esquemaCambiarRol,
  esquemaFiltroUsuarios,
  esquemaIdUsuario,
  filtrarUsuarios,
  puedeCambiarRol,
  puedeVerificar,
  type PerfilListado,
} from "@/features/usuarios/validacion";

const ID_ADMIN = "11111111-1111-4111-8111-111111111111";
const ID_OTRO = "22222222-2222-4222-8222-222222222222";

const perfiles: PerfilListado[] = [
  { id: "a", nombre: "Ana", rol: "generador", verificado: false, distrito: "Surco", tipo_generador: "hogar", creado_en: "" },
  { id: "b", nombre: "Julio", rol: "recolector", verificado: false, distrito: "SJL", tipo_generador: null, creado_en: "" },
  { id: "c", nombre: "Rosa", rol: "recolector", verificado: true, distrito: "Ate", tipo_generador: null, creado_en: "" },
];

describe("HU-03 verificación de recolectores y gestión de roles", () => {
  it("CA1: el filtro pendientes muestra solo recolectores sin verificar", () => {
    expect(filtrarUsuarios(perfiles, "pendientes").map((p) => p.nombre)).toEqual(["Julio"]);
    expect(filtrarUsuarios(perfiles, "todos")).toHaveLength(3);
  });

  it("CA1: un filtro desconocido vuelve a 'todos' (no rompe la página)", () => {
    expect(esquemaFiltroUsuarios.parse("cualquier-cosa")).toBe("todos");
    expect(esquemaFiltroUsuarios.parse(undefined)).toBe("todos");
    expect(esquemaFiltroUsuarios.parse("pendientes")).toBe("pendientes");
  });

  it("CA2: solo se puede verificar a un recolector pendiente", () => {
    expect(puedeVerificar(perfiles[1])).toBe(true);
    expect(puedeVerificar(perfiles[2])).toBe(false); // ya verificado
    expect(puedeVerificar(perfiles[0])).toBe(false); // no es recolector
  });

  it("CA2: el admin puede asignar admin_acopio a otro usuario", () => {
    expect(esquemaCambiarRol.safeParse({ id: ID_OTRO, rol: "admin_acopio" }).success).toBe(true);
    expect(puedeCambiarRol(ID_ADMIN, ID_OTRO)).toBe(true);
  });

  it("seguridad: el admin no puede cambiarse su propio rol (evita quedarse sin administradores)", () => {
    expect(puedeCambiarRol(ID_ADMIN, ID_ADMIN)).toBe(false);
  });

  it("CA3 (seguridad): rechaza roles inexistentes e ids manipulados", () => {
    expect(esquemaCambiarRol.safeParse({ id: ID_OTRO, rol: "superadmin" }).success).toBe(false);
    expect(esquemaCambiarRol.safeParse({ id: "1 or 1=1", rol: "admin" }).success).toBe(false);
    expect(esquemaIdUsuario.safeParse({ id: "x".repeat(500) }).success).toBe(false);
    expect(esquemaIdUsuario.safeParse({ id: ID_OTRO }).success).toBe(true);
  });
});
