import { describe, expect, it } from "vitest";
import { esquemaLogin } from "@/features/auth/validacion";

describe("validación de login", () => {
  it("acepta datos correctos y normaliza el correo", () => {
    const r = esquemaLogin.safeParse({ email: "  Ana@Correo.com ", password: "secreta123" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ana@correo.com");
  });

  it("rechaza correo inválido", () => {
    expect(esquemaLogin.safeParse({ email: "no-es-correo", password: "secreta123" }).success).toBe(false);
  });

  it("rechaza contraseña corta o demasiado larga", () => {
    expect(esquemaLogin.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
    expect(esquemaLogin.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(false);
  });

  it("rechaza intento de inyección como tipo no texto", () => {
    expect(esquemaLogin.safeParse({ email: { $ne: null }, password: "secreta123" }).success).toBe(false);
  });
});
