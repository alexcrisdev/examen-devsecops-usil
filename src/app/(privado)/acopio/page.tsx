import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { SeccionProxima } from "@/components/seccion-proxima";

export default async function Pagina() {
  await exigirRol(rolesPara("/acopio"));
  return <SeccionProxima etiqueta="Administrador de acopio" titulo="Mi punto de acopio" hu="HU-04" sprint="Sprint 2" />;
}
