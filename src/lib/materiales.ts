// Catálogo de materiales (mismo código que la tabla public.materiales) con su color de contenedor.
export const MATERIALES = [
  { codigo: "papel", nombre: "Papel", color: "bg-mat-papel", detalle: "Hojas, cuadernos, periódicos y revistas" },
  { codigo: "carton", nombre: "Cartón", color: "bg-mat-carton", detalle: "Cajas plegadas, empaques y tubos" },
  { codigo: "plastico", nombre: "Plástico", color: "bg-mat-plastico", detalle: "Botellas PET, envases y bolsas limpias" },
  { codigo: "vidrio", nombre: "Vidrio", color: "bg-mat-vidrio", detalle: "Botellas y frascos sin tapa" },
  { codigo: "metal", nombre: "Metal", color: "bg-mat-metal", detalle: "Latas, chatarra liviana y aluminio" },
  { codigo: "electronicos", nombre: "Electrónicos", color: "bg-mat-electronicos", detalle: "RAEE: celulares, cables y pequeños aparatos" },
] as const;

export type CodigoMaterial = (typeof MATERIALES)[number]["codigo"];
