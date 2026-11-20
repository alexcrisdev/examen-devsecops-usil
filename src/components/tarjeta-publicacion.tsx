import { MATERIALES } from "@/lib/materiales";
import { NOMBRE_ESTADO, type Estado } from "@/features/publicaciones/validacion";

const COLOR_ESTADO: Record<Estado, string> = {
  disponible: "bg-brote text-bosque",
  reservado: "bg-mat-plastico/40 text-tinta",
  recogido: "bg-bosque text-brote",
  cancelada: "bg-papel-2 text-tinta/50",
};

type Props = {
  material: string;
  kg: number;
  distrito: string;
  referencia: string | null;
  franja: string;
  estado: Estado;
  children?: React.ReactNode;
};

// Tarjeta tipo "ticket" de una publicación de material.
export function TarjetaPublicacion({ material, kg, distrito, referencia, franja, estado, children }: Props) {
  const m = MATERIALES.find((x) => x.codigo === material);
  return (
    <li className="flex flex-col rounded-[1.5rem] border border-linea bg-[#fffdf6] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="titular text-3xl text-bosque">
          <span className={`mr-2 inline-block h-3 w-3 rounded-[4px] align-middle ${m?.color ?? ""}`} aria-hidden="true" />
          {m?.nombre ?? material} <em className="text-hoja">{kg} kg</em>
        </p>
        <span className={`etiqueta shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] ${COLOR_ESTADO[estado]}`}>
          {NOMBRE_ESTADO[estado]}
        </span>
      </div>
      <p className="mt-2 text-sm text-tinta/70">
        {distrito}
        {referencia ? ` · ${referencia}` : ""} · {franja}
      </p>
      {children}
    </li>
  );
}
