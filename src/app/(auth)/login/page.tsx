import Link from "next/link";
import { FormularioLogin } from "./formulario";

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión en EcoGreen</h1>
      <FormularioLogin />
      <p className="text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
