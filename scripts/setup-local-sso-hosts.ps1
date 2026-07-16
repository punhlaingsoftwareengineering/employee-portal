# Run this script in an elevated PowerShell (Run as administrator).
# Adds 127.0.0.1 entries for portal/drive/docs hostnames from .env (local dev only).

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot '.env'
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

. (Join-Path $PSScriptRoot 'lib\read-dotenv.ps1')

$envVars = Read-DotEnv $envPath
$portalOrigin = Get-EnvValue $envVars @('ORIGIN', 'PORTAL_ORIGIN')
$driveOrigin = Get-EnvValue $envVars @('DRIVE_ORIGIN')
$docsOrigin = Get-EnvValue $envVars @('DOCS_ORIGIN')
$orderResendOrigin = Get-EnvValue $envVars @('ORDER_RESEND_ORIGIN')
$mariChatbotOrigin = Get-EnvValue $envVars @('MARI_CHATBOT_ORIGIN')

if (-not $portalOrigin -or -not $driveOrigin) {
	throw 'Set ORIGIN and DRIVE_ORIGIN in .env before running hosts setup.'
}

$entries = @(
	"127.0.0.1 $((Get-OriginUri $portalOrigin).Host)",
	"127.0.0.1 $((Get-OriginUri $driveOrigin).Host)"
)

if ($docsOrigin) {
	$entries += "127.0.0.1 $((Get-OriginUri $docsOrigin).Host)"
}

if ($orderResendOrigin) {
	$entries += "127.0.0.1 $((Get-OriginUri $orderResendOrigin).Host)"
}

if ($mariChatbotOrigin) {
	$entries += "127.0.0.1 $((Get-OriginUri $mariChatbotOrigin).Host)"
}

$content = Get-Content $hostsPath -Raw
foreach ($entry in $entries) {
	if ($content -notmatch [regex]::Escape($entry)) {
		Add-Content -Path $hostsPath -Value $entry
		Write-Host "Added: $entry"
	} else {
		Write-Host "Already present: $entry"
	}
}

Write-Host ''
Write-Host 'Hosts updated. Install Caddy if needed: winget install -e --id CaddyServer.Caddy'
Write-Host 'Then from employee-portal: pnpm caddy:dev'
