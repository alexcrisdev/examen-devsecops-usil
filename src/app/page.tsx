import Link from "next/link";

export default function Inicio() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">NOMBRE DEL SISTEMA</h1>
      <p className="text-center text-sm opacity-80">Descripción corta del caso.</p>
      <Link href="/login" className="rounded bg-black px-4 py-2 text-white">
        Ingresar
      </Link>
    </main>
  );
}
