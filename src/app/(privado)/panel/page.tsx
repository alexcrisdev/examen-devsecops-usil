import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import { menuPara, rolesPara } from "@/lib/navegacion";
import type { Rol } from "@/lib/roles";

const BIENVENIDA: Record<Rol, { titulo: string; texto: string }> = {
  generador: {
    titulo: "Tu material, en buenas manos",
    texto: "Publica lo que tienes separado para que un recolector verificado de tu distrito pase a recogerlo.",
  },
  recolector: {
    titulo: "Planifica tu ruta de hoy",
    texto: "Revisa el material disponible en tu zona y reserva los recojos que te convengan.",
  },
  admin_acopio: {
    titulo: "Tu punto, visible para todos",
    texto: "Mantén al día los materiales que recibes y tu horario, y registra las entregas del día.",
  },
  admin: {
    titulo: "La red EcoGreen, bajo control",
    texto: "Verifica recolectores, asigna administradores de acopio y revisa la auditoría.",
  },
};

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const { perfil } = await exigirRol(rolesPara("/panel"));
  const { aviso } = await searchParams;
  const b = BIENVENIDA[perfil.rol];
  const accesos = menuPara(perfil.rol).filter((i) => i.href !== "/panel");

  return (
    <>
      {aviso === "sin-permiso" && (
        <p role="alert" className="mb-8 rounded-2xl border border-alerta/30 bg-alerta/10 px-5 py-4 text-sm text-alerta">
          <strong>Acceso denegado.</strong> Esa sección no corresponde a tu rol.
        </p>
      )}
      <p className="etiqueta text-musgo">Panel</p>
      <h1 className="titular mt-3 text-5xl text-bosque sm:text-6xl">
        Hola, <em className="resaltado">{perfil.nombre}</em>
      </h1>
      <div className="mt-10 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[2rem] bg-bosque p-8 text-papel md:p-10">
          <h2 className="titular text-4xl">{b.titulo}</h2>
          <p className="mt-4 max-w-lg text-papel/80">{b.texto}</p>
        </section>
        <section className="flex flex-col gap-3">
          {accesos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center justify-between rounded-[1.5rem] border-2 border-tinta bg-papel p-6 transition hover:bg-brote"
            >
              <span className="titular text-2xl text-bosque">{a.texto}</span>
              <span aria-hidden="true" className="text-2xl transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
