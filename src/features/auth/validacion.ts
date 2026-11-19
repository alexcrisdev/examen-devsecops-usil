import { z } from "zod";

// Validación en servidor de todo lo que llega del navegador (OWASP A03).
export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido").max(254),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;
