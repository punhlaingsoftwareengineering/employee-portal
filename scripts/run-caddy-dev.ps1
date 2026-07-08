# Start local/production reverse proxy using Caddyfile.generated from .env.

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$config = Join-Path $repoRoot 'Caddyfile.generated'
$envPath = Join-Path $repoRoot '.env'
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

. (Join-Path $PSScriptRoot 'lib\read-dotenv.ps1')

function Find-CaddyExe {
	$cmd = Get-Command caddy -ErrorAction SilentlyContinue
	if ($cmd) {
		return $cmd.Source
	}

	$links = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\caddy.exe'
	if (Test-Path $links) {
		return $links
	}

	$packagesRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
	if (Test-Path $packagesRoot) {
		$wingetExe = Get-ChildItem -Path $packagesRoot -Recurse -Filter 'caddy.exe' -ErrorAction SilentlyContinue |
			Select-Object -First 1 -ExpandProperty FullName
		if ($wingetExe) {
			return $wingetExe
		}
	}

	throw @"
Caddy not found. Install it with:
  winget install -e --id CaddyServer.Caddy
Then close and reopen this terminal, or run this script again.
"@
}

if (-not (Test-Path $config)) {
	& (Join-Path $PSScriptRoot 'render-caddyfile.ps1')
}

$envVars = Read-DotEnv $envPath
$portalOrigin = Get-EnvValue $envVars @('ORIGIN', 'PORTAL_ORIGIN')
$driveOrigin = Get-EnvValue $envVars @('DRIVE_ORIGIN')

$requiredHosts = @()
if ($portalOrigin) { $requiredHosts += (Get-OriginUri $portalOrigin).Host }
if ($driveOrigin) { $requiredHosts += (Get-OriginUri $driveOrigin).Host }
$requiredHosts = $requiredHosts | Where-Object { $_ } | Select-Object -Unique

$hostsContent = Get-Content $hostsPath -Raw
$missingHosts = @()
foreach ($hostName in $requiredHosts) {
	if ($hostsContent -notmatch [regex]::Escape($hostName)) {
		$missingHosts += $hostName
	}
}

if ($missingHosts.Count -gt 0) {
	$looksLocal = $true
	foreach ($hostName in $requiredHosts) {
		if ($hostName -notmatch '\.(local|localhost|test)$') {
			$looksLocal = $false
			break
		}
	}

	if ($looksLocal) {
		Write-Host 'ERROR: hosts file is missing SSO domains from .env:' -ForegroundColor Red
		foreach ($hostName in $missingHosts) {
			Write-Host "  - $hostName"
		}
		Write-Host ''
		Write-Host 'Fix (run PowerShell as Administrator):' -ForegroundColor Yellow
		Write-Host '  powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1'
		exit 1
	}

	Write-Host 'WARN: hosts file does not list production domains (expected on a real server):' -ForegroundColor Yellow
	foreach ($hostName in $missingHosts) {
		Write-Host "  - $hostName"
	}
}

$existingCaddy = Get-Process caddy -ErrorAction SilentlyContinue
if ($existingCaddy) {
	Write-Host 'ERROR: Caddy is already running. Stop it first:' -ForegroundColor Red
	Write-Host '  taskkill /IM caddy.exe /F'
	exit 1
}

$caddyExe = Find-CaddyExe
Write-Host "Using Caddy: $caddyExe"
Write-Host "Config: $config"
if ($portalOrigin) { Write-Host "Portal: $portalOrigin" }
if ($driveOrigin) { Write-Host "Drive:  $driveOrigin" }
Write-Host ''

& $caddyExe run --config $config
