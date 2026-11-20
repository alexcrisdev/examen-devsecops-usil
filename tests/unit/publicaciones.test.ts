import { describe, expect, it } from "vitest";
import {
  ACCIONES_PUBLICACION,
  esquemaAccionPublicacion,
  esquemaFiltroDisponibles,
  esquemaPublicacion,
  siguienteEstado,
} from "@/features/publicaciones/validacion";

const valida = {
  material: "plastico",
  cantidad_kg: "5",
  distrito: "Surco",
  referencia: "",
  franja_inicio: "09:00",
  franja_fin: "12:00",
  direccion: "Jr. Las Flores 123",
  telefono: "",
};

describe("HU-08 publicar material reciclable", () => {
  it("CA1: acepta plástico 5 kg con franja 09:00-12:00", () => {
    const r = esquemaPublicacion.parse(valida);
    expect(r.cantidad_kg).toBe(5);
    expect(r.telefono).toBeNull();
  });

  it("CA2: rechaza cantidad 0, negativa o material fuera del catálogo", () => {
    expect(esquemaPublicacion.safeParse({ ...valida, cantidad_kg: "0" }).success).toBe(false);
    expect(esquemaPublicacion.safeParse({ ...valida, cantidad_kg: "-3" }).success).toBe(false);
    expect(esquemaPublicacion.safeParse({ ...valida, material: "uranio" }).success).toBe(false);
    expect(esquemaPublicacion.safeParse({ ...valida, franja_fin: "08:00" }).success).toBe(false);
  });

  it("CA3 (seguridad): ignora estado y dueño enviados por el navegador", () => {
    const r = esquemaPublicacion.parse({ ...valida, estado: "recogido", generador_id: "otro" });
    expect(r).not.toHaveProperty("estado");
    expect(r).not.toHaveProperty("generador_id");
  });
});

describe("HU-09 ver publicaciones disponibles", () => {
  it("CA3 (seguridad): filtros manipulados se descartan", () => {
    expect(esquemaFiltroDisponibles.parse({ material: "x' or 1=1", distrito: "y".repeat(200) })).toEqual({
      material: undefined,
      distrito: undefined,
    });
  });
});

describe("HU-10 reservar y confirmar recojo", () => {
  it("CA1: disponible → reservado al reservar", () => {
    expect(siguienteEstado("disponible", "reservar")).toBe("reservado");
  });

  it("CA2: no se puede reservar algo ya reservado (evita doble reserva)", () => {
    expect(siguienteEstado("reservado", "reservar")).toBeNull();
  });

  it("CA3: solo transiciones válidas", () => {
    expect(siguienteEstado("reservado", "recoger")).toBe("recogido");
    expect(siguienteEstado("reservado", "liberar")).toBe("disponible");
    expect(siguienteEstado("disponible", "recoger")).toBeNull();
    expect(siguienteEstado("recogido", "liberar")).toBeNull();
    expect(siguienteEstado("cancelada", "reservar")).toBeNull();
  });

  it("CA4 (seguridad): reservar es solo para recolectores; cancelar solo para el generador", () => {
    expect(ACCIONES_PUBLICACION.reservar.rol).toBe("recolector");
    expect(ACCIONES_PUBLICACION.cancelar.rol).toBe("generador");
    expect(esquemaAccionPublicacion.safeParse({ id: "no-uuid", accion: "reservar" }).success).toBe(false);
    expect(
      esquemaAccionPublicacion.safeParse({ id: "22222222-2222-4222-8222-222222222222", accion: "borrar" }).success,
    ).toBe(false);
  });
});
