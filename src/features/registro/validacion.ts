import { z } from "zod";

// Tipos que una persona puede elegir al registrarse en EcoGreen.
// Los roles administrativos NO están aquí: solo los asigna el admin (HU-03).
export const TIPOS_REGISTRO = ["hogar", "negocio", "recolector"] as const;
export type TipoRegistro = (typeof TIPOS_REGISTRO)[number];

export const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(120),
  email: z.string().trim().toLowerCase().email("Correo no válido").max(254),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  distrito: z.string().trim().min(2, "Ingresa tu distrito").max(80),
  tipo: z.enum(TIPOS_REGISTRO, { message: "Elige un tipo de usuario válido" }),
});
// zod descarta campos extra (ej. "rol": "admin") por defecto.

export type DatosRegistro = z.infer<typeof esquemaRegistro>;

export type MetadataRegistro = {
  nombre: string;
  distrito: string;
  rol: "generador" | "recolector";
  tipo_generador: "hogar" | "negocio" | null;
};

// Regla pura: el rol se deriva del tipo elegido, nunca de un campo "rol" del navegador.
// La BD vuelve a aplicar la misma regla en el trigger crear_perfil_nuevo_usuario.
export function metadataDeRegistro(datos: DatosRegistro): MetadataRegistro {
  const esRecolector = datos.tipo === "recolector";
  return {
    nombre: datos.nombre,
    distrito: datos.distrito,
    rol: esRecolector ? "recolector" : "generador",
    tipo_generador: datos.tipo === "recolector" ? null : datos.tipo,
  };
}
