import { redirect } from "next/navigation";
import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";

export default async function Pagina() {
  await exigirRol(rolesPara("/admin"));
  redirect("/admin/usuarios");
}
