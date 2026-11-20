import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { SeccionProxima } from "@/components/seccion-proxima";

export default async function Pagina() {
  await exigirRol(rolesPara("/admin"));
  return <SeccionProxima etiqueta="Administración" titulo="Administración de EcoGreen" hu="HU-03" sprint="Sprint 1" />;
}
