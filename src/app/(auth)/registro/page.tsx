import Link from "next/link";
import { FormularioRegistro } from "./formulario";

export const metadata = { title: "Crear cuenta · EcoGreen" };

export default function PaginaRegistro() {
  return (
    <>
      <p className="etiqueta text-musgo">Únete a la ruta</p>
      <h1 className="titular mt-3 text-5xl text-bosque">
        Crea tu cuenta en <em className="text-hoja">EcoGreen</em>
      </h1>
      <p className="mt-3 text-tinta/70">Elige cómo participarás. Toma menos de un minuto.</p>
      <div className="mt-8">
        <FormularioRegistro />
      </div>
      <p className="mt-8 text-sm text-tinta/75">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-hoja underline decoration-brote decoration-2 underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
