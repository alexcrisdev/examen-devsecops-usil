import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { describirAccion, esquemaFiltroAuditoria } from "@/features/auditoria/validacion";

describe("HU-07 auditoría de acciones sensibles", () => {
  it("CA2: filtra por una acción conocida", () => {
    expect(esquemaFiltroAuditoria.parse({ accion: "cambiar_rol" }).accion).toBe("cambiar_rol");
  });

  it("CA2: un filtro manipulado se ignora", () => {
    expect(esquemaFiltroAuditoria.parse({ accion: "'; delete from auditoria--" }).accion).toBeUndefined();
  });

  it("CA1: describe en español cada acción registrada", () => {
    expect(describirAccion("verificar_recolector")).toBe("Verificó a un recolector");
    expect(describirAccion("otra")).toBe("Acción desconocida");
  });

  it("CA3 (seguridad): la auditoría es solo inserción y lectura (sin update ni delete)", () => {
    const sql = readdirSync("supabase/migrations")
      .map((f) => readFileSync(`supabase/migrations/${f}`, "utf8"))
      .join("\n")
      .toLowerCase();
    expect(sql).toContain("grant select, insert on public.auditoria to authenticated");
    expect(sql).not.toMatch(/grant[^;]*(update|delete)[^;]*on public\.auditoria/);
    expect(sql).not.toMatch(/policy[^;]*on public\.auditoria for (update|delete)/);
  });
});
