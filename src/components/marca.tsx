import Link from "next/link";

// Isotipo EcoGreen: una hoja que se cierra en bucle (reciclaje) con una semilla lima.
export function Isotipo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="var(--bosque)" />
      <path
        d="M11 28c0-9.5 6.5-16 18-17-0.6 11.2-6.8 18-16.4 18"
        fill="none"
        stroke="var(--brote)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M12.6 29 9.5 25.6M12.6 29l4-0.6" stroke="var(--brote)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M14.5 25.5c3-4.2 6.6-7.4 10.5-9.6" stroke="#fffdf6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="29.5" cy="27.5" r="3" fill="var(--brote)" />
    </svg>
  );
}

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="EcoGreen, inicio">
      <Isotipo />
      <span className={`titular text-[1.6rem] ${claro ? "text-papel" : "text-bosque"}`}>
        Eco<span className="italic text-hoja group-hover:text-brote">Green</span>
      </span>
    </Link>
  );
}
