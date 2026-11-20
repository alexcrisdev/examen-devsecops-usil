import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { SeccionProxima } from "@/components/seccion-proxima";

export default async function Pagina() {
  await exigirRol(rolesPara("/publicaciones"));
  return <SeccionProxima etiqueta="Generador" titulo="Mis publicaciones" hu="HU-08" sprint="Sprint 3" />;
}
