import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { SeccionProxima } from "@/components/seccion-proxima";

export default async function Pagina() {
  await exigirRol(rolesPara("/recolector"));
  return <SeccionProxima etiqueta="Recolector" titulo="Material disponible" hu="HU-09" sprint="Sprint 3" />;
}
