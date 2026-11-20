import { exigirRol } from "@/lib/auth";
import { NOMBRE_ROL, ROLES } from "@/lib/roles";
import { cerrarSesion } from "@/features/auth/actions";

export default async function Panel() {
  const { perfil } = await exigirRol([...ROLES]);
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Hola, {perfil.nombre}</h1>
      <p className="text-sm">Rol: {NOMBRE_ROL[perfil.rol]}</p>
      <form action={cerrarSesion}>
        <button className="rounded border px-3 py-2">Cerrar sesión</button>
      </form>
    </main>
  );
}
