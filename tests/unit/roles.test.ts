import { describe, expect, it } from "vitest";
import { esRol, ROLES_REGISTRO, tienePermiso } from "@/lib/roles";

describe("roles de EcoGreen", () => {
  it("reconoce los 4 roles del caso", () => {
    for (const r of ["generador", "recolector", "admin_acopio", "admin"]) expect(esRol(r)).toBe(true);
    expect(esRol("usuario")).toBe(false);
    expect(esRol("hacker")).toBe(false);
    expect(esRol(undefined)).toBe(false);
  });

  it("solo permite los roles indicados", () => {
    expect(tienePermiso("admin", ["admin"])).toBe(true);
    expect(tienePermiso("recolector", ["admin"])).toBe(false);
    expect(tienePermiso("Admin", ["admin"])).toBe(false);
  });

  it("el registro público nunca ofrece roles administrativos", () => {
    expect(ROLES_REGISTRO).not.toContain("admin");
    expect(ROLES_REGISTRO).not.toContain("admin_acopio");
  });
});
