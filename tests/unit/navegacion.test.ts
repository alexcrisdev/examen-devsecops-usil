import { describe, expect, it } from "vitest";
import { menuPara, rolesPara, rutaPermitida } from "@/lib/navegacion";
import { ROLES } from "@/lib/roles";

describe("HU-02 acceso y menú por rol", () => {
  it("CA1: todos los roles pueden entrar a su panel", () => {
    for (const rol of ROLES) expect(rutaPermitida("/panel", rol)).toBe(true);
  });

  it("CA1: cada rol ve en su menú solo opciones permitidas para él", () => {
    for (const rol of ROLES) {
      const menu = menuPara(rol);
      expect(menu.length).toBeGreaterThan(0);
      for (const item of menu) expect(rutaPermitida(item.href, rol)).toBe(true);
    }
  });

  it("CA1: el menú cambia según el rol", () => {
    expect(menuPara("admin").map((i) => i.href)).toContain("/admin/usuarios");
    expect(menuPara("generador").map((i) => i.href)).not.toContain("/admin/usuarios");
    expect(menuPara("recolector").map((i) => i.href)).toContain("/recolector");
    expect(menuPara("admin_acopio").map((i) => i.href)).toContain("/acopio");
  });

  it("CA3 (seguridad): un generador o recolector no puede entrar a /admin", () => {
    expect(rutaPermitida("/admin", "generador")).toBe(false);
    expect(rutaPermitida("/admin/usuarios", "recolector")).toBe(false);
    expect(rutaPermitida("/admin/usuarios", "admin")).toBe(true);
  });

  it("CA3 (seguridad): cada sección solo para su rol", () => {
    expect(rutaPermitida("/recolector", "generador")).toBe(false);
    expect(rutaPermitida("/acopio", "recolector")).toBe(false);
    expect(rutaPermitida("/publicaciones", "recolector")).toBe(false);
    expect(rolesPara("/acopio")).toEqual(["admin_acopio"]);
  });

  it("seguridad: no se confunde /admin con rutas que solo empiezan igual", () => {
    expect(rutaPermitida("/administrador", "admin")).toBe(false);
  });

  it("seguridad: rol inválido o ruta desconocida se deniega", () => {
    expect(rutaPermitida("/panel", "hacker")).toBe(false);
    expect(rutaPermitida("/panel", undefined)).toBe(false);
    expect(rutaPermitida("/otra-cosa", "admin")).toBe(false);
  });
});
