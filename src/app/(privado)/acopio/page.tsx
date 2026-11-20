import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { obtenerMiPunto } from "@/features/puntos/datos";
import { FormularioPunto } from "./formulario";

export default async function PaginaMiPunto() {
  const { supabase, user } = await exigirRol(rolesPara("/acopio"));
  const punto = await obtenerMiPunto(supabase, user.id);
  return (
    <>
      <p className="etiqueta text-musgo">Administrador de acopio</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular text-5xl text-bosque">{punto ? punto.nombre : "Publica tu punto de acopio"}</h1>
        {punto && (
          <Link href={`/puntos/${punto.id}`} className="text-sm font-semibold text-hoja underline decoration-brote decoration-2 underline-offset-4">
            Ver cómo lo ven los ciudadanos →
          </Link>
        )}
      </div>
      <p className="mt-3 max-w-xl text-tinta/70">
        Indica qué materiales recibes y tu horario. Aparecerás en el directorio público de EcoGreen.
      </p>
      <div className="mt-8">
        <FormularioPunto punto={punto} />
      </div>
    </>
  );
}
