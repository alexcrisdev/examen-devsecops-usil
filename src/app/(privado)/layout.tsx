import { exigirRol } from "@/lib/auth";
import { menuPara } from "@/lib/navegacion";
import { NOMBRE_ROL, ROLES } from "@/lib/roles";
import { cerrarSesion } from "@/features/auth/actions";
import { Marca } from "@/components/marca";
import { MenuPrivado } from "@/components/menu-privado";

// Área privada: exige sesión. Cada página vuelve a exigir SU rol con rolesPara().
export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const { perfil } = await exigirRol([...ROLES]);
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-linea bg-papel/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Marca />
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold">{perfil.nombre}</p>
              <p className="etiqueta text-[0.62rem] text-musgo">{NOMBRE_ROL[perfil.rol]}</p>
            </div>
            <form action={cerrarSesion}>
              <button className="boton boton-secundario px-4 py-2 text-sm">Salir</button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6">
          <MenuPrivado items={menuPara(perfil.rol)} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
