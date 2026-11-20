import { describe, expect, it } from "vitest";
import { esquemaFiltroPuntos, esquemaPunto, estaAbierto, filtrarPuntos, horaLima } from "@/features/puntos/validacion";

const punto = {
  nombre: "Acopio Surco Verde",
  direccion: "Av. Benavides 1234",
  distrito: "Santiago de Surco",
  referencia: "",
  dias_atencion: "Lun a Sáb",
  hora_apertura: "08:00",
  hora_cierre: "17:00",
  telefono_publico: "",
  materiales: ["vidrio", "carton", "vidrio"],
};

describe("HU-04 registrar y editar punto de acopio", () => {
  it("CA1: acepta un punto válido, quita materiales repetidos y normaliza vacíos", () => {
    const r = esquemaPunto.parse(punto);
    expect(r.materiales).toEqual(["vidrio", "carton"]);
    expect(r.referencia).toBeNull();
    expect(r.telefono_publico).toBeNull();
  });

  it("CA1: exige al menos un material", () => {
    expect(esquemaPunto.safeParse({ ...punto, materiales: [] }).success).toBe(false);
  });

  it("CA2: rechaza cierre menor o igual a la apertura", () => {
    expect(esquemaPunto.safeParse({ ...punto, hora_cierre: "08:00" }).success).toBe(false);
    expect(esquemaPunto.safeParse({ ...punto, hora_cierre: "07:00" }).success).toBe(false);
  });

  it("seguridad: rechaza materiales fuera del catálogo, horas inválidas y textos enormes", () => {
    expect(esquemaPunto.safeParse({ ...punto, materiales: ["uranio"] }).success).toBe(false);
    expect(esquemaPunto.safeParse({ ...punto, hora_apertura: "25:00" }).success).toBe(false);
    expect(esquemaPunto.safeParse({ ...punto, nombre: "x".repeat(500) }).success).toBe(false);
    expect(esquemaPunto.safeParse({ ...punto, telefono_publico: "<script>" }).success).toBe(false);
  });
});

describe("HU-05 buscar puntos por material y distrito", () => {
  const puntos = [
    { distrito: "Santiago de Surco", materiales: ["vidrio", "papel"] },
    { distrito: "Miraflores", materiales: ["vidrio"] },
    { distrito: "Surquillo", materiales: ["metal"] },
  ];

  it("CA1: filtra por material y distrito a la vez", () => {
    expect(filtrarPuntos(puntos, { material: "vidrio", distrito: "Surco" })).toHaveLength(1);
  });

  it("CA1: ignora mayúsculas y tildes en el distrito", () => {
    expect(filtrarPuntos([{ distrito: "Jesús María", materiales: [] }], { distrito: "jesus maria" })).toHaveLength(1);
  });

  it("CA2: sin coincidencias devuelve lista vacía", () => {
    expect(filtrarPuntos(puntos, { material: "electronicos" })).toHaveLength(0);
  });

  it("CA3 (seguridad): parámetros manipulados se descartan", () => {
    expect(esquemaFiltroPuntos.parse({ material: "'; drop table--", distrito: "x".repeat(300) })).toEqual({
      material: undefined,
      distrito: undefined,
    });
  });
});

describe("HU-06 detalle y horario del punto", () => {
  it("CA1: con horario 08:00-17:00 a las 10:00 está abierto", () => {
    expect(estaAbierto("08:00:00", "17:00:00", "10:00")).toBe(true);
  });

  it("CA1: antes de abrir o justo al cerrar está cerrado", () => {
    expect(estaAbierto("08:00", "17:00", "07:59")).toBe(false);
    expect(estaAbierto("08:00", "17:00", "17:00")).toBe(false);
  });

  it("usa la hora de Lima (UTC-5)", () => {
    expect(horaLima(new Date("2026-11-20T15:30:00Z"))).toBe("10:30");
  });
});
