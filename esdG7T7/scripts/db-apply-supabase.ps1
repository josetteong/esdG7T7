# Requires: Docker Desktop
# Applies schema.sql and seed.sql to Supabase using env in ../.env

param(
  [string]$EnvPath = "..\.env"
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $here '..')
$envFile = Resolve-Path (Join-Path $here $EnvPath)

if (-not (Test-Path $envFile)) { throw ".env not found at $envFile" }

# Load .env into environment
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^(\s*#|\s*$)') { return }
  if ($_ -match '^([^=]+)=(.*)$') {
    $k = $matches[1].Trim()
    $v = $matches[2].Trim().Trim('"')
    $env:$k = $v
  }
}

$required = 'DB_USER','DB_PASSWORD','DB_HOST','DB_PORT','DB_NAME'
foreach ($k in $required) {
  if (-not $env:$k) { throw "Missing $k in $envFile" }
}

$PGPASSWORD = $env:DB_PASSWORD
$CONN = "host=$($env:DB_HOST) port=$($env:DB_PORT) user=$($env:DB_USER) dbname=$($env:DB_NAME) sslmode=require"

Write-Host "Applying schema.sql and seed.sql to $($env:DB_HOST)/$($env:DB_NAME) as $($env:DB_USER)" -ForegroundColor Cyan

$cmd = @(
  'docker','run','--rm',
  '-e',"PGPASSWORD=$PGPASSWORD",
  '-v',"$root:/sql",'-w','/sql',
  'postgres:15-alpine','sh','-lc',
  "psql \"$CONN\" -v ON_ERROR_STOP=1 -f schema.sql -f seed.sql"
)

& $cmd[0] $cmd[1..($cmd.Length-1)]