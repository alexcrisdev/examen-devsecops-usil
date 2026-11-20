import Link from "next/link";
import { Marca } from "@/components/marca";

// Directorio público de puntos de acopio (no requiere cuenta).
export default function LayoutPuntos({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-linea">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Marca />
          <nav className="flex items-center gap-4">
            <Link href="/puntos" className="hidden text-sm font-semibold hover:text-hoja sm:inline">
              Puntos de acopio
            </Link>
            <Link href="/panel" className="boton boton-primario px-4 py-2 text-sm">
              Mi cuenta
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
