import { describe, expect, it } from "vitest";
import { esRol, tienePermiso } from "@/lib/roles";

describe("roles", () => {
  it("reconoce roles válidos", () => {
    expect(esRol("admin")).toBe(true);
    expect(esRol("hacker")).toBe(false);
    expect(esRol(undefined)).toBe(false);
  });

  it("solo permite los roles indicados", () => {
    expect(tienePermiso("admin", ["admin"])).toBe(true);
    expect(tienePermiso("usuario", ["admin"])).toBe(false);
    expect(tienePermiso("Admin", ["admin"])).toBe(false);
  });
});
