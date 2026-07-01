$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

npm install
npx prisma generate

Write-Host "Setup complete. Run scripts\run_windows.ps1 to start KindlyCV AI."
