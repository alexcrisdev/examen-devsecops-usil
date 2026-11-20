import Link from "next/link";
import { FormularioLogin } from "./formulario";

export const metadata = { title: "Ingresar · EcoGreen" };

export default function PaginaLogin() {
  return (
    <>
      <p className="etiqueta text-musgo">Bienvenido de vuelta</p>
      <h1 className="titular mt-3 text-5xl text-bosque">
        Ingresa a <em className="text-hoja">EcoGreen</em>
      </h1>
      <p className="mt-3 text-tinta/70">Sigue la ruta de tus reciclables y tus recojos.</p>
      <div className="mt-8">
        <FormularioLogin />
      </div>
      <p className="mt-8 text-sm text-tinta/75">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-hoja underline decoration-brote decoration-2 underline-offset-4">
          Regístrate gratis
        </Link>
      </p>
    </>
  );
}
