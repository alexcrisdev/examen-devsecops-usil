import { describe, expect, it } from "vitest";
import {
  calcularIndicadores,
  esquemaCalificacion,
  esquemaEntrega,
  materialPermitido,
  promedio,
  puedeCalificar,
} from "@/features/impacto/validacion";

const UUID = "33333333-3333-4333-8333-333333333333";

describe("HU-11 registrar entregas en el punto", () => {
  it("CA1: acepta 12.5 kg de cartón", () => {
    expect(esquemaEntrega.parse({ material: "carton", kg: "12.5" })).toEqual({ material: "carton", kg: 12.5 });
  });

  it("CA2: rechaza kg ≤ 0 y materiales que el punto no recibe", () => {
    expect(esquemaEntrega.safeParse({ material: "carton", kg: "0" }).success).toBe(false);
    expect(esquemaEntrega.safeParse({ material: "carton", kg: "-1" }).success).toBe(false);
    expect(materialPermitido(["vidrio", "papel"], "carton")).toBe(false);
    expect(materialPermitido(["vidrio", "papel"], "vidrio")).toBe(true);
  });

  it("seguridad: rechaza material fuera del catálogo o kg no numérico", () => {
    expect(esquemaEntrega.safeParse({ material: "oro", kg: "1" }).success).toBe(false);
    expect(esquemaEntrega.safeParse({ material: "metal", kg: "abc" }).success).toBe(false);
  });
});

describe("HU-12 indicadores de impacto", () => {
  it("CA1: suma kg por material y por mes, y cuenta recojos y recolectores", () => {
    const r = calcularIndicadores(
      [
        { material_codigo: "carton", kg: 10, fecha: "2026-11-20" },
        { material_codigo: "carton", kg: 2.5, fecha: "2026-12-01" },
        { material_codigo: "vidrio", kg: 4, fecha: "2026-12-02" },
      ],
      [
        { estado: "recogido", recolector_id: "r1", cantidad_kg: 5 },
        { estado: "recogido", recolector_id: "r1", cantidad_kg: 3 },
        { estado: "recogido", recolector_id: "r2", cantidad_kg: 1 },
        { estado: "disponible", recolector_id: null, cantidad_kg: 7 },
      ],
      [
        { rol: "recolector", verificado: true },
        { rol: "recolector", verificado: false },
        { rol: "generador", verificado: false },
      ],
    );
    expect(r.kgTotal).toBe(16.5);
    expect(r.kgPorMaterial.carton).toBe(12.5);
    expect(r.kgPorMes).toEqual({ "2026-12": 6.5, "2026-11": 10 });
    expect(r.recojosRealizados).toBe(3);
    expect(r.kgRecogidosEnRecojos).toBe(9);
    expect(r.publicacionesDisponibles).toBe(1);
    expect(r.recolectoresVerificados).toBe(1);
    expect(r.recolectoresActivos).toBe(2);
  });

  it("CA2: sin datos todo queda en cero sin errores", () => {
    const r = calcularIndicadores([], [], []);
    expect(r.kgTotal).toBe(0);
    expect(r.recojosRealizados).toBe(0);
    expect(Object.values(r.kgPorMaterial).every((v) => v === 0)).toBe(true);
  });
});

describe("HU-13 calificar al recolector", () => {
  const pub = { estado: "recogido", generador_id: "g1", recolector_id: "r1" };

  it("CA1: el dueño califica un recojo terminado con 1 a 5", () => {
    expect(puedeCalificar(pub, "g1", false)).toBe(true);
    expect(esquemaCalificacion.safeParse({ publicacion_id: UUID, puntaje: "5" }).success).toBe(true);
    expect(promedio([5, 4, 4])).toBe(4.3);
    expect(promedio([])).toBeNull();
  });

  it("CA2: no se califica dos veces ni un recojo no terminado", () => {
    expect(puedeCalificar(pub, "g1", true)).toBe(false);
    expect(puedeCalificar({ ...pub, estado: "reservado" }, "g1", false)).toBe(false);
  });

  it("CA3 (seguridad): otro usuario no puede calificar; puntajes fuera de rango se rechazan", () => {
    expect(puedeCalificar(pub, "intruso", false)).toBe(false);
    expect(esquemaCalificacion.safeParse({ publicacion_id: UUID, puntaje: "6" }).success).toBe(false);
    expect(esquemaCalificacion.safeParse({ publicacion_id: UUID, puntaje: "0" }).success).toBe(false);
    expect(esquemaCalificacion.safeParse({ publicacion_id: UUID, puntaje: "4.5" }).success).toBe(false);
  });
});
