// Encabezado de una sección privada cuya funcionalidad llega en un sprint posterior.
export function SeccionProxima({ etiqueta, titulo, hu, sprint }: { etiqueta: string; titulo: string; hu: string; sprint: string }) {
  return (
    <>
      <p className="etiqueta text-musgo">{etiqueta}</p>
      <h1 className="titular mt-3 text-5xl text-bosque">{titulo}</h1>
      <div className="mt-10 rounded-[2rem] border-2 border-dashed border-linea p-10 text-center">
        <p className="titular text-3xl text-hoja">En camino</p>
        <p className="mt-2 text-tinta/70">
          Esta sección se construye en {hu} ({sprint}).
        </p>
      </div>
    </>
  );
}
