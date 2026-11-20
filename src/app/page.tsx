import Link from "next/link";
import { Marca } from "@/components/marca";
import { MATERIALES } from "@/lib/materiales";

const pasos = [
  {
    n: "01",
    titulo: "Separa y publica",
    texto: "Indica qué material tienes, cuántos kilos aproximados y en qué franja horaria puede pasar alguien.",
  },
  {
    n: "02",
    titulo: "Un recolector lo reserva",
    texto: "Recolectores verificados de tu distrito ven tu aviso y lo reservan. Recién ahí ven tu dirección exacta.",
  },
  {
    n: "03",
    titulo: "Llega a un punto de acopio",
    texto: "El material se entrega en un punto formal y se registra en kilos. Lo que separaste no termina en la basura.",
  },
];

export default function Inicio() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ---------- Encabezado ---------- */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Marca />
        <nav className="flex items-center gap-2 sm:gap-6">
          <a href="#como-funciona" className="hidden text-sm font-medium hover:text-hoja md:inline">
            Cómo funciona
          </a>
          <a href="#para-quien" className="hidden text-sm font-medium hover:text-hoja md:inline">
            Para quién
          </a>
          <Link href="/login" className="text-sm font-semibold hover:text-hoja">
            Ingresar
          </Link>
          <Link href="/registro" className="boton boton-primario px-4 py-2 text-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-14">
          <div>
            <p className="etiqueta mb-6 inline-flex items-center gap-2 text-musgo">
              <span className="h-2 w-2 rounded-full bg-hoja" /> Reciclaje que sí llega a su destino
            </p>
            <h1 className="titular text-[3.1rem] text-bosque sm:text-7xl lg:text-[5.4rem]">
              Lo que tú separas,{" "}
              <em className="resaltado font-normal">alguien</em> lo recoge.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-tinta/80">
              EcoGreen conecta a hogares y negocios que separan sus reciclables con los recolectores de su zona y
              con los puntos de acopio cercanos. Menos vueltas a ciegas, más material recuperado.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/registro" className="boton boton-primario text-base">
                Quiero entregar mis reciclables
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/registro" className="boton boton-secundario text-base">
                Soy recolector
              </Link>
            </div>
          </div>

          {/* Ticket de recojo: ilustra el producto */}
          <div className="relative mx-auto w-full max-w-sm rounded-[2rem] bg-papel-2 p-7 sm:p-9">
            <div className="ticket relative -rotate-2 rounded-2xl">
              <div className="p-6 pb-5">
                <div className="flex items-center justify-between">
                  <span className="etiqueta text-musgo">Aviso de recojo</span>
                  <span className="etiqueta text-musgo">#0241</span>
                </div>
                <p className="titular mt-4 text-4xl text-bosque">
                  Cartón <span className="italic text-hoja">12 kg</span>
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
                  <dt className="text-musgo">Distrito</dt>
                  <dd className="text-right font-medium">Santiago de Surco</dd>
                  <dt className="text-musgo">Franja</dt>
                  <dd className="text-right font-medium">09:00 – 12:00</dd>
                  <dt className="text-musgo">Generador</dt>
                  <dd className="text-right font-medium">Bodega · negocio</dd>
                </dl>
              </div>
              <div className="relative">
                <span className="muesca -left-[13px]" />
                <span className="muesca -right-[13px]" />
                <div className="perforado mx-5" />
              </div>
              <div className="flex items-center gap-3 p-6 pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-bosque font-semibold text-brote">
                  J
                </span>
                <div className="text-sm leading-tight">
                  <p className="font-semibold">Julio R.</p>
                  <p className="text-musgo">Recolector verificado</p>
                </div>
              </div>
              <div className="sello pointer-events-none absolute -right-5 -bottom-6 grid h-28 w-28 place-items-center rounded-full border-[3px] border-hoja bg-brote/90 text-center text-hoja">
                <span className="etiqueta leading-tight font-bold">
                  Recogido
                  <br />✓
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Cinta de materiales ---------- */}
        <div className="overflow-hidden border-y-2 border-tinta bg-bosque py-4" aria-hidden="true">
          <div className="cinta flex w-max gap-10 whitespace-nowrap">
            {[0, 1].map((copia) =>
              MATERIALES.map((m) => (
                <span key={`${copia}-${m.codigo}`} className="titular flex items-center gap-10 text-3xl text-papel">
                  <span className="italic">{m.nombre}</span>
                  <span className="text-brote">✺</span>
                </span>
              )),
            )}
          </div>
        </div>

        {/* ---------- Cómo funciona ---------- */}
        <section id="como-funciona" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="titular max-w-xl text-5xl text-bosque sm:text-6xl">
              La ruta de tu <em className="text-hoja">reciclaje</em>
            </h2>
            <p className="max-w-sm text-tinta/75">
              Tres pasos. Tu dirección exacta solo la ve el recolector que reservó tu aviso.
            </p>
          </div>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="ruta absolute top-9 right-[16%] left-[16%] hidden h-3 md:block" aria-hidden="true" />
            {pasos.map((p) => (
              <li key={p.n} className="relative">
                <span className="relative z-10 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border-2 border-tinta bg-papel">
                  <span className="titular text-3xl text-hoja">{p.n}</span>
                </span>
                <h3 className="titular mt-6 text-3xl">{p.titulo}</h3>
                <p className="mt-3 leading-relaxed text-tinta/75">{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Para quién ---------- */}
        <section id="para-quien" className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-20 sm:px-6 md:grid-cols-6">
          <article className="rounded-[2rem] bg-bosque p-8 text-papel md:col-span-4 md:p-10">
            <p className="etiqueta text-brote">Hogares y negocios</p>
            <h3 className="titular mt-4 text-4xl sm:text-5xl">
              Separa en casa o en tu local, <em className="text-brote">nosotros conectamos</em> el resto.
            </h3>
            <p className="mt-5 max-w-lg text-papel/80">
              Encuentra qué punto de acopio recibe cada material y su horario, o publica tu material para que un
              recolector pase por él.
            </p>
          </article>
          <article className="flex flex-col justify-between rounded-[2rem] bg-brote p-8 md:col-span-2">
            <p className="etiqueta text-bosque">Recolectores</p>
            <h3 className="titular mt-4 text-3xl text-bosque">
              Sabe dónde hay material <em>antes</em> de salir.
            </h3>
            <p className="mt-4 text-sm text-bosque/80">Filtra por distrito y material, reserva y planifica tu ruta.</p>
          </article>
          <article className="rounded-[2rem] border-2 border-tinta p-8 md:col-span-2">
            <p className="etiqueta text-musgo">Puntos de acopio</p>
            <h3 className="titular mt-4 text-3xl text-bosque">Publica qué recibes y cuándo atiendes.</h3>
          </article>
          <article className="rounded-[2rem] bg-papel-2 p-8 md:col-span-4">
            <p className="etiqueta text-musgo">Materiales que mueve EcoGreen</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {MATERIALES.map((m) => (
                <li key={m.codigo} className="flex gap-3">
                  <span className={`mt-1 h-4 w-4 shrink-0 rounded-[5px] ${m.color}`} aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{m.nombre}</span>
                    <span className="block text-xs text-tinta/65">{m.detalle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* ---------- Llamado final ---------- */}
        <section className="mx-auto mb-16 w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border-2 border-tinta bg-papel p-8 sm:flex-row sm:items-center md:p-12">
            <h2 className="titular text-4xl text-bosque sm:text-5xl">
              Que tu reciclaje <span className="resaltado italic">no vuelva</span> a la basura.
            </h2>
            <Link href="/registro" className="boton boton-primario shrink-0 text-base">
              Crear mi cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-linea">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-musgo sm:px-6">
          <Marca />
          <p>Tus datos se tratan conforme a la Ley N.° 29733 de Protección de Datos Personales.</p>
        </div>
      </footer>
    </div>
  );
}
