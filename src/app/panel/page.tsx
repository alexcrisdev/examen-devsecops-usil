import { exigirRol } from "@/lib/auth";
import { NOMBRE_ROL, ROLES } from "@/lib/roles";
import { cerrarSesion } from "@/features/auth/actions";
import { Marca } from "@/components/marca";

export default async function Panel() {
  const { perfil } = await exigirRol([...ROLES]);
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-linea">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Marca />
          <form action={cerrarSesion}>
            <button className="boton boton-secundario px-4 py-2 text-sm">Cerrar sesión</button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <p className="etiqueta text-musgo">{NOMBRE_ROL[perfil.rol]}</p>
        <h1 className="titular mt-3 text-5xl text-bosque sm:text-6xl">
          Hola, <em className="resaltado">{perfil.nombre}</em>
        </h1>
        <p className="mt-4 max-w-xl text-tinta/75">
          Este es tu panel de EcoGreen. Aquí aparecerán tus opciones según tu rol.
        </p>
      </main>
    </div>
  );
}
