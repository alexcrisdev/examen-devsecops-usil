import Link from "next/link";
import { FormularioRegistro } from "./formulario";

export const metadata = { title: "Crear cuenta · EcoGreen" };

export default function PaginaRegistro() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Crear cuenta en EcoGreen</h1>
      <FormularioRegistro />
      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
