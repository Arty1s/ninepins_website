$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutputDir = Join-Path $ProjectRoot ".data"
$OutputFile = Join-Path $OutputDir "kolky-sync-result.json"
$SummaryFile = Join-Path $OutputDir "kolky-sync-summary.json"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$Backend = "http://127.0.0.1:8000"
$SyncUrl = "$Backend/api/admin/sync?from=2025-09-01&to=2027-06-30&mode=live&full_refresh=true"

Write-Host "Checking FastAPI backend..." -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Method Get "$Backend/health" -TimeoutSec 10
  Write-Host "Backend OK: $($health.service)" -ForegroundColor Green
} catch {
  Write-Host "Backend is not reachable at $Backend" -ForegroundColor Red
  Write-Host "Start it with:" -ForegroundColor Yellow
  Write-Host "cd $ProjectRoot\backend"
  Write-Host ".\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
  throw
}

Write-Host "Running live kolky.sk sync from YOUR PowerShell..." -ForegroundColor Cyan
Write-Host $SyncUrl -ForegroundColor DarkCyan

$response = Invoke-RestMethod -Method Post $SyncUrl -TimeoutSec 300
$response | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $OutputFile

$summary = [ordered]@{
  ok = $response.ok
  status = $response.status
  counts = $response.counts
  created = $response.created
  updated = $response.updated
  staleRemoved = $response.staleRemoved
  fullRefreshSkipped = $response.fullRefreshSkipped
  fullRefreshSkipReason = $response.fullRefreshSkipReason
  teamResults = $response.team_results | ForEach-Object {
    [ordered]@{
      category = $_.category
      league_id = $_.league_id
      team_id = $_.team_id
      rounds = $_.available_rounds_count
      roundList = $_.available_rounds_discovered
      leagueRows = $_.all_league_matches_parsed
      hlohovecRows = $_.hlohovec_matches_after_id_filtering
      imported = $_.matches_imported
      completed = $_.completed
      upcoming = $_.upcoming
      firstError = if ($_.errors -and $_.errors.Count -gt 0) { $_.errors[0] } else { $null }
    }
  }
  firstErrors = $response.logs | Where-Object { $_.level -eq "error" } | Select-Object -First 10
  firstWarnings = $response.logs | Where-Object { $_.level -eq "warning" } | Select-Object -First 10
}

$summary | ConvertTo-Json -Depth 30 | Set-Content -Encoding UTF8 $SummaryFile

Write-Host "Saved full result:" -ForegroundColor Green
Write-Host $OutputFile
Write-Host "Saved summary:" -ForegroundColor Green
Write-Host $SummaryFile
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
$summary | ConvertTo-Json -Depth 12
