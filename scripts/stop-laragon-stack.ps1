$ErrorActionPreference = 'SilentlyContinue'

$ports = 4000, 6333, 6334, 6379

foreach ($port in $ports) {
  $listeners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) {
    Stop-Process -Id $listener.OwningProcess -Force
  }
}

& 'C:\Users\HP PRO\tools\pgsql\bin\pg_ctl.exe' -D 'C:\Users\HP PRO\tools\pgsql\data' stop | Out-Null

Write-Output 'ReplyAI stack stopped.'
