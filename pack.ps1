param([int]$v=2)

Remove-Item ".\package.zip" 2>$null
Copy-Item "manifest.v$v.json" -Destination ".\package\manifest.json"
Compress-Archive ".\package\*" -DestinationPath ".\package.zip"
Remove-Item ".\package\manifest.json"