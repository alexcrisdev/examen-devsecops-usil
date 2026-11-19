// Health check para el smoke test del pipeline. No expone datos internos.
export function GET() {
  return Response.json({ estado: "ok" });
}
