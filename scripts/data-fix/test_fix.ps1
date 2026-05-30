
# Test on chapter_1.json
$filePath = "C:\Users\User\OneDrive\Documents\80-20 exam\public\hsc\social_2nd\chapter_1.json"
$backupPath = "C:\Users\User\OneDrive\Documents\80-20 exam\public\hsc\social_2nd\chapter_1.json.bak"

# Backup
Copy-Item -LiteralPath $filePath -Destination $backupPath -Force

$json = Get-Content -LiteralPath $filePath -Raw -Encoding UTF8 | ConvertFrom-Json

# Test: modify Q6
$json[5].question = $json[5].question + " [Test College]"
Write-Output ("Q6 new text: " + $json[5].question)

$newJson = $json | ConvertTo-Json -Depth 10

[System.IO.File]::WriteAllText($filePath, $newJson, [System.Text.Encoding]::UTF8)

# Restore from backup
Copy-Item -LiteralPath $backupPath -Destination $filePath -Force
Remove-Item -LiteralPath $backupPath -Force

Write-Output "Test complete"
