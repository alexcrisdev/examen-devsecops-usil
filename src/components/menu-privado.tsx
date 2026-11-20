"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; texto: string };

// Menú del área privada. Los items llegan ya filtrados por rol desde el servidor.
export function MenuPrivado({ items }: { items: Item[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Menú principal" className="flex gap-1 overflow-x-auto">
      {items.map((i) => {
        const activo = ruta === i.href || (i.href !== "/panel" && ruta.startsWith(i.href + "/"));
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
              activo ? "bg-bosque text-brote" : "text-tinta/75 hover:bg-papel-2 hover:text-tinta"
            }`}
          >
            {i.texto}
          </Link>
        );
      })}
    </nav>
  );
}
