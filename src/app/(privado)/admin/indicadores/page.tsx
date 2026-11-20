import { exigirRol } from "@/lib/auth";
import { rolesPara } from "@/lib/navegacion";
import { MATERIALES } from "@/lib/materiales";
import { datosIndicadores } from "@/features/impacto/datos";
import { calcularIndicadores } from "@/features/impacto/validacion";

const mesTexto = (m: string) =>
  new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-01T00:00:00Z`));

export default async function PaginaIndicadores() {
  const { supabase } = await exigirRol(rolesPara("/admin/indicadores"));
  const d = await datosIndicadores(supabase);
  const ind = calcularIndicadores(d.entregas, d.publicaciones, d.perfiles);
  const maximo = Math.max(1, ...Object.values(ind.kgPorMaterial));

  const tarjetas = [
    { valor: `${ind.kgTotal} kg`, texto: "Recibidos en puntos de acopio" },
    { valor: ind.recojosRealizados, texto: `Recojos realizados (${ind.kgRecogidosEnRecojos} kg)` },
    { valor: ind.recolectoresActivos, texto: `Recolectores activos de ${ind.recolectoresVerificados} verificados` },
    { valor: ind.publicacionesDisponibles, texto: "Avisos esperando recojo" },
  ];

  return (
    <>
      <p className="etiqueta text-musgo">Administración</p>
      <h1 className="titular mt-3 text-5xl text-bosque">
        Impacto de <em className="resaltado">EcoGreen</em>
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t, i) => (
          <div key={t.texto} className={`rounded-[1.75rem] p-6 ${i === 0 ? "bg-bosque text-papel" : "border-2 border-tinta bg-[#fffdf6]"}`}>
            <p className={`titular text-5xl ${i === 0 ? "text-brote" : "text-bosque"}`}>{t.valor}</p>
            <p className={`mt-2 text-sm ${i === 0 ? "text-papel/75" : "text-tinta/65"}`}>{t.texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[2rem] bg-papel-2 p-6 md:p-8">
          <h2 className="etiqueta text-musgo">Kg recibidos por material</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {MATERIALES.map((m) => {
              const kg = ind.kgPorMaterial[m.codigo] ?? 0;
              return (
                <li key={m.codigo} className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-3 text-sm">
                  <span className="font-medium">{m.nombre}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-papel">
                    <span className={`block h-full rounded-full ${m.color}`} style={{ width: `${(kg / maximo) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{kg} kg</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-[2rem] border border-linea bg-[#fffdf6] p-6 md:p-8">
          <h2 className="etiqueta text-musgo">Kg recibidos por mes</h2>
          {Object.keys(ind.kgPorMes).length === 0 ? (
            <p className="mt-5 text-tinta/60">Aún no hay entregas registradas.</p>
          ) : (
            <ul className="mt-5 flex flex-col divide-y divide-linea">
              {Object.entries(ind.kgPorMes).map(([mes, kg]) => (
                <li key={mes} className="flex justify-between py-2.5 text-sm">
                  <span className="capitalize">{mesTexto(mes)}</span>
                  <span className="font-semibold tabular-nums">{kg} kg</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <p className="mt-4 text-xs text-tinta/55">Calculado en el servidor a partir de entregas, publicaciones y perfiles.</p>
    </>
  );
}
