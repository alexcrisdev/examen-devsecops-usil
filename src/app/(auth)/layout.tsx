import { Marca } from "@/components/marca";
import { MATERIALES } from "@/lib/materiales";

// Pantallas de acceso: panel verde con el mensaje de marca + formulario sobre papel.
export default function LayoutAcceso({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-bosque p-12 text-papel lg:flex">
        <Marca claro />
        <div>
          <p className="etiqueta text-brote">Hogares · negocios · recolectores · acopio</p>
          <p className="titular mt-6 text-6xl leading-[0.95]">
            Cada kilo que separas <em className="text-brote">tiene a dónde ir.</em>
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {MATERIALES.map((m) => (
            <li key={m.codigo} className="flex items-center gap-2 rounded-full border border-papel/25 px-3 py-1.5 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} aria-hidden="true" />
              {m.nombre}
            </li>
          ))}
        </ul>
        {/* anillo decorativo */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full border-[28px] border-hoja/40"
          aria-hidden="true"
        />
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="lg:hidden">
          <Marca />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
