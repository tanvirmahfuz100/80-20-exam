# cleanup_v4.ps1 - Clean up v4 parser output

$json = [System.IO.File]::ReadAllText("public\bank\agradut_combined.json", [System.Text.Encoding]::UTF8)
$questions = $json | ConvertFrom-Json
Write-Host "Loaded $($questions.Count) questions"

$bnDigit = @{'০'='0';'১'='1';'২'='2';'৩'='3';'৪'='4';'৫'='5';'৬'='6';'৭'='7';'৮'='8';'৯'='9'}

$cleaned = @()

foreach ($q in $questions) {
    $question = $q.question
    $id = $q.id
    $answer = $q.answer
    $source = $q.source
    $explanation = $q.explanation
    $options = @{}
    $q.PSObject.Properties | Where-Object { $_.Name -eq "options" } | ForEach-Object {
        $_.Value.PSObject.Properties | ForEach-Object {
            $options[$_.Name] = $_.Value
        }
    }
    
    # Skip if no meaningful question text
    if (-not $question -or $question.Length -lt 5) { continue }
    
    # Clean up question text: remove leading garbage like "০৩.২০২৪ ১."
    $question = $question -replace '^[\d.০১২৩৪৫৬৭৮৯।]+\s+', ''
    $question = $question -replace '^[\d.]+\.\s*[\d.]+\s+', ''
    $question = $question -replace '^\d+\.\d+\.\d+\s+\d+\.\s+', ''
    
    # Remove header noise like "পদের নাম:", "পরীক্ষার তারিখ:", etc.
    $question = $question -replace 'পদের নাম:\s*[^\s]+\s+', ''
    $question = $question -replace 'পরীক্ষার তারিখ:\s*[\d./]+\s*', ''
    $question = $question -replace 'পূর্ণমান:\s*\d+\s*', ''
    $question = $question -replace 'সমন্বিত\s+\d+\s+ব্যাংক[^]*?(?=\p{Bengali}||[A-Z])', ''
    
    # Clean whitespace
    $question = ($question -replace '\s+', ' ').Trim()
    
    # Fix ID: if it contains Bengali digits, convert
    if ($id -match '[০১২৩৪৫৬৭৮৯]') {
        $digits = ''
        foreach ($ch in $id.ToCharArray()) {
            if ($bnDigit.ContainsKey($ch)) { $digits += $bnDigit[$ch] }
            else { $digits += $ch }
        }
        $id = $digits
    }
    
    # Ensure ID is a number
    $idNum = 0
    if (-not [int]::TryParse($id, [ref]$idNum)) { $idNum = 0 }
    
    # Fix options: clean up option values
    $cleanOpts = [Ordered]@{}
    foreach ($key in @('A','B','C','D')) {
        if ($options.ContainsKey($key)) {
            $val = ($options[$key] -replace '\s+', ' ').Trim()
            # Remove trailing garbage like "উ.ক", "পূর্ণমান:"
            $val = $val -replace 'উ\.?\s*[কখগঘ]\s*$', ''
            $val = $val -replace 'পূর্ণমান:\s*\d+', ''
            $val = $val.Trim()
            if ($val) { $cleanOpts[$key] = $val }
        }
    }
    
    # Skip if no options or empty
    if ($cleanOpts.Count -lt 2) { continue }
    if (-not $answer) { continue }
    
    # Clean explanation
    if ($explanation) {
        $explanation = ($explanation -replace '\s+', ' ').Trim()
    }
    
    $cleaned += @{
        id = $idNum
        question = $question
        options = $cleanOpts
        answer = $answer
        source = $source
        explanation = if ($explanation) { $explanation } else { "" }
    }
}

Write-Host "Cleaned: $($cleaned.Count) questions"

# Remove duplicates (same question text, same source)
$seen = @{}
$unique = @()
foreach ($q in $cleaned) {
    $key = "$($q.question)|$($q.source)"
    if (-not $seen.ContainsKey($key)) {
        $seen[$key] = $true
        $unique += $q
    }
}

Write-Host "Unique: $($unique.Count) questions"

# Save
$unique | ConvertTo-Json -Depth 10 | Out-File "public\bank\bank_combined.json" -Encoding utf8
Write-Host "Saved to public\bank\bank_combined.json"

# Also save per-exam files
$bySource = $unique | Group-Object source
foreach ($group in $bySource) {
    $name = $group.Name
    $qs = $group.Group
    $safe = $name -replace '[^\w\s-]','' -replace '\s+','_'
    if ($safe.Length -gt 80) { $safe = $safe.Substring(0,80) }
    $qs | ConvertTo-Json -Depth 10 | Out-File "public\bank\bank_$safe.json" -Encoding utf8
}
Write-Host "Saved $($bySource.Count) per-exam files"
