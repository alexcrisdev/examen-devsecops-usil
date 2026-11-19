// Hook PreToolUse del harness: bloquea acciones peligrosas del agente.
// Exit 2 = bloquear; el mensaje de stderr se le muestra al agente.
let entrada = "";
process.stdin.on("data", (c) => (entrada += c));
process.stdin.on("end", () => {
  let datos = {};
  try {
    datos = JSON.parse(entrada);
  } catch {
    process.exit(0);
  }
  const input = datos.tool_input ?? {};
  const bloquear = (motivo) => {
    process.stderr.write(`BLOQUEADO por el harness: ${motivo}\n`);
    process.exit(2);
  };

  // 1. Archivos de secretos: ni leer ni escribir.
  const ruta = String(input.file_path ?? input.path ?? "").replace(/\\/g, "/");
  if (/(^|\/)\.env(\.(?!example$)[^/]*)?$/.test(ruta)) {
    bloquear(`no se accede a ${ruta}; contiene secretos. Usa .env.example.`);
  }

  // 2. Comandos de shell peligrosos.
  const cmd = String(input.command ?? "");
  if (cmd) {
    const reglas = [
      [/git\s+push\s+.*(--force|-f\b)/, "push --force no está permitido."],
      [/git\s+push\s+(\S+\s+)?(main|develop)\b/, "no se hace push directo a main/develop; usa una rama hu/ y PR."],
      [/git\s+commit\b/, null], // se valida abajo
      [/git\s+reset\s+--hard/, "reset --hard puede borrar trabajo; pídeselo al usuario."],
      [/rm\s+-rf\s+(\/|~|\.\s*$)/, "borrado masivo bloqueado."],
      [/supabase\s+db\s+reset\b.*--linked/, "db reset en la BD remota borra todos los datos."],
      [/(cat|type|Get-Content)\s+[^|]*\.env(\.local)?\b(?!\.example)/, "no se muestran archivos de secretos."],
      [/--no-verify/, "no se saltan los hooks de git."],
    ];
    for (const [patron, motivo] of reglas) if (motivo && patron.test(cmd)) bloquear(motivo);

    if (/git\s+commit\b/.test(cmd) && /-m\s/.test(cmd) && !/HU-\d+:|chore:|docs:|ci:/.test(cmd)) {
      bloquear('mensaje de commit debe ser "HU-XX: descripción" (o chore:/docs:/ci:).');
    }
    if (/Co-Authored-By/i.test(cmd)) bloquear("no agregues Co-Authored-By en los commits.");
  }
  process.exit(0);
});
