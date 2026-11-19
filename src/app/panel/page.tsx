import { exigirRol } from "@/lib/auth";
import { cerrarSesion } from "@/features/auth/actions";

export default async function Panel() {
  const { perfil } = await exigirRol(["admin", "usuario"]);
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Hola, {perfil.nombre}</h1>
      <p className="text-sm">Rol: {perfil.rol}</p>
      <form action={cerrarSesion}>
        <button className="rounded border px-3 py-2">Cerrar sesión</button>
      </form>
    </main>
  );
}
