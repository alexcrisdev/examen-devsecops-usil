import { describe, expect, it } from "vitest";
import { esquemaRegistro, metadataDeRegistro } from "@/features/registro/validacion";

const valido = {
  nombre: "Ana Pérez",
  email: " Ana@Correo.com ",
  password: "secreta123",
  distrito: "Surco",
  tipo: "hogar",
};

describe("HU-01 registro de generador y recolector", () => {
  it("CA1: acepta un generador hogar con datos válidos y normaliza el correo", () => {
    const r = esquemaRegistro.safeParse(valido);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ana@correo.com");
  });

  it("CA1: el tipo negocio se registra como generador tipo negocio", () => {
    const r = esquemaRegistro.parse({ ...valido, tipo: "negocio" });
    expect(metadataDeRegistro(r)).toMatchObject({ rol: "generador", tipo_generador: "negocio" });
  });

  it("CA2: el tipo recolector se registra como recolector sin tipo de generador", () => {
    const r = esquemaRegistro.parse({ ...valido, tipo: "recolector" });
    const meta = metadataDeRegistro(r);
    expect(meta.rol).toBe("recolector");
    expect(meta.tipo_generador).toBeNull();
  });

  it("CA1: rechaza contraseña de menos de 8 caracteres y distrito vacío", () => {
    expect(esquemaRegistro.safeParse({ ...valido, password: "1234567" }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...valido, distrito: "  " }).success).toBe(false);
  });

  it("CA3 (seguridad): rechaza intentos de registrarse como admin o admin_acopio", () => {
    expect(esquemaRegistro.safeParse({ ...valido, tipo: "admin" }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...valido, tipo: "admin_acopio" }).success).toBe(false);
  });

  it("CA3 (seguridad): ignora un campo rol extra enviado por el navegador", () => {
    const r = esquemaRegistro.parse({ ...valido, rol: "admin" });
    expect(metadataDeRegistro(r).rol).toBe("generador");
  });

  it("seguridad: rechaza strings enormes y tipos no texto", () => {
    expect(esquemaRegistro.safeParse({ ...valido, nombre: "x".repeat(500) }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...valido, email: { $ne: null } }).success).toBe(false);
  });
});
