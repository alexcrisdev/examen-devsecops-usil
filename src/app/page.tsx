import Link from "next/link";

export default function Inicio() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">EcoGreen</h1>
      <p className="text-center text-sm opacity-80">Encuentra puntos de acopio, publica tus reciclables y conecta con recolectores de tu zona.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded bg-green-700 px-4 py-2 text-white">
          Ingresar
        </Link>
        <Link href="/registro" className="rounded border border-green-700 px-4 py-2 text-green-700">
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
