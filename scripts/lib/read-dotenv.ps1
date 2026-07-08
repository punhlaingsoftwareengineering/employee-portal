function Read-DotEnv {
	param([Parameter(Mandatory = $true)][string]$Path)

	if (-not (Test-Path $Path)) {
		throw "Env file not found: $Path"
	}

	$vars = @{}
	foreach ($line in Get-Content $Path) {
		$trimmed = $line.Trim()
		if (-not $trimmed -or $trimmed.StartsWith('#')) {
			continue
		}
		$eq = $trimmed.IndexOf('=')
		if ($eq -lt 1) {
			continue
		}
		$key = $trimmed.Substring(0, $eq).Trim()
		$value = $trimmed.Substring($eq + 1).Trim()
		if (
			($value.StartsWith('"') -and $value.EndsWith('"')) -or
			($value.StartsWith("'") -and $value.EndsWith("'"))
		) {
			$value = $value.Substring(1, $value.Length - 2)
		}
		$vars[$key] = $value
	}
	return $vars
}

function Get-EnvValue {
	param(
		[hashtable]$Vars,
		[Parameter(Mandatory = $true)][string[]]$Keys
	)

	foreach ($key in $Keys) {
		if ($Vars.ContainsKey($key) -and $Vars[$key]) {
			return $Vars[$key].Trim()
		}
	}
	return $null
}

function Get-OriginUri {
	param([Parameter(Mandatory = $true)][string]$Origin)

	try {
		return [Uri]$Origin
	} catch {
		throw "Invalid origin URL: $Origin"
	}
}

function Get-CaddySiteBlock {
	param(
		[Parameter(Mandatory = $true)][string]$Origin,
		[Parameter(Mandatory = $true)][string]$Upstream,
		[string]$TlsMode
	)

	$uri = Get-OriginUri $Origin
	$siteHost = $uri.Host
	if (-not $siteHost) {
		throw "Origin is missing hostname: $Origin"
	}

	$useAutoTls = $false
	switch ($TlsMode) {
		'auto' { $useAutoTls = $true }
		'off' { $useAutoTls = $false }
		default {
			$useAutoTls = $uri.Scheme -eq 'https'
		}
	}

	if ($useAutoTls) {
		return @"
$siteHost {
	reverse_proxy $Upstream
}
"@
	}

	return @"
http://$siteHost {
	reverse_proxy $Upstream
}
"@
}
