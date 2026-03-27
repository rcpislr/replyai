$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pgRoot = 'C:\Users\HP PRO\tools\pgsql'
$redisRoot = 'C:\Users\HP PRO\tools\redis'
$qdrantRoot = 'C:\Users\HP PRO\tools\qdrant-1.17.1'
$nextApps = @('web', 'dashboard', 'admin')

function Ensure-ProcessListening {
  param(
    [int]$Port,
    [scriptblock]$StartAction
  )

  $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  if ($listener) {
    return
  }

  & $StartAction
  Start-Sleep -Seconds 3
}

Ensure-ProcessListening -Port 5432 -StartAction {
  & "$pgRoot\bin\pg_ctl.exe" -D "$pgRoot\data" -l "$pgRoot\postgres.log" start | Out-Null
}

Ensure-ProcessListening -Port 6379 -StartAction {
  Start-Process -FilePath "$redisRoot\redis-server.exe" -ArgumentList "$redisRoot\redis.windows.conf" -WindowStyle Hidden
}

Ensure-ProcessListening -Port 6333 -StartAction {
  Start-Process -FilePath "$qdrantRoot\qdrant.exe" -WorkingDirectory $qdrantRoot -ArgumentList '--config-path', 'config.yaml' -WindowStyle Hidden
}

$singlePort = Get-NetTCPConnection -State Listen -LocalPort 4000 -ErrorAction SilentlyContinue
if (-not $singlePort) {
  foreach ($app in $nextApps) {
    $nextPath = Join-Path $repoRoot "apps\$app\.next"
    if (Test-Path $nextPath) {
      Remove-Item -LiteralPath $nextPath -Recurse -Force
    }
  }

  Start-Process -FilePath 'pnpm.cmd' -ArgumentList '--filter', '@replyai/api', 'dev:single' -WorkingDirectory $repoRoot -WindowStyle Hidden
}

Write-Output 'ReplyAI stack started.'
Write-Output 'App: http://localhost'
Write-Output 'Dashboard: http://localhost/dashboard'
Write-Output 'Admin: http://localhost/admin'
Write-Output 'API health: http://localhost/health'
