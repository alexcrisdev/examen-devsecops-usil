#!/usr/bin/env bash
# Configura el repo del examen: secretos de Actions, rama develop y protección de ramas.
# Uso (Git Bash, en la raíz del repo ya subido a GitHub):  bash scripts/configurar-github.sh
# Pide cada secreto sin mostrarlo en pantalla. Enter vacío = no lo cambia.
set -euo pipefail

repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repositorio: $repo"

for nombre in SUPABASE_ACCESS_TOKEN SUPABASE_DB_PASSWORD SUPABASE_PROJECT_ID \
              VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID VERCEL_AUTOMATION_BYPASS_SECRET; do
  read -r -s -p "$nombre: " valor; echo
  if [ -n "$valor" ]; then
    printf '%s' "$valor" | gh secret set "$nombre" --repo "$repo"
    echo "  guardado"
  fi
done

# Rama develop desde main (si no existe).
if ! gh api "repos/$repo/branches/develop" >/dev/null 2>&1; then
  sha=$(gh api "repos/$repo/git/ref/heads/main" -q .object.sha)
  gh api "repos/$repo/git/refs" -f ref=refs/heads/develop -f sha="$sha" >/dev/null
  echo "Rama develop creada"
fi

# Protección: PR obligatorio + CI y seguridad en verde. (Repo público o plan Pro.)
for rama in main develop; do
  gh api -X PUT "repos/$repo/branches/$rama/protection" --input - >/dev/null <<JSON
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["Lint, tipos, pruebas y build", "Resultado de seguridad"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
  echo "Protección aplicada a $rama"
done

gh api -X PUT "repos/$repo/vulnerability-alerts" >/dev/null && echo "Alertas Dependabot activadas"
echo "Listo. Revisa: Settings -> Branches y Settings -> Secrets and variables -> Actions"
