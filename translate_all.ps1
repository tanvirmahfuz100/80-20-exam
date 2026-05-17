function Write-Utf8Json($path, $data) {
    $json = $data | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($path, $json, [System.Text.Encoding]::UTF8)
}

function Read-Utf8Json($path) {
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    return $content | ConvertFrom-Json
}

function Get-BnTranslation($texts) {
    if ($texts.Count -eq 0) { return @() }
    
    $results = @()
    
    $batchSize = 12
    for ($start = 0; $start -lt $texts.Count; $start += $batchSize) {
        $end = [Math]::Min($start + $batchSize, $texts.Count)
        $batchItems = $texts[$start..($end-1)]
        
        $numbered = @()
        for ($i = 0; $i -lt $batchItems.Count; $i++) {
            $n = $start + $i + 1
            $numbered += "$n) $($batchItems[$i])"
        }
        $batchText = $numbered -join "`n"
        $enc = [System.Net.WebUtility]::UrlEncode($batchText)
        $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=bn&tl=en&dt=t&q=$enc"
        
        $success = $false
        $retries = 0
        while (-not $success -and $retries -lt 3) {
            try {
                $result = Invoke-RestMethod -Uri $url -TimeoutSec 60
                $fullText = ""
                $segments = $result[0]
                foreach ($seg in $segments) {
                    $segText = $seg[0]
                    if ($segText) { $fullText += $segText }
                }
                $parts = [regex]::Split($fullText, '\d+\)\s*') | Where-Object { $_.Trim() -ne '' }
                foreach ($part in $parts) {
                    $results += $part.Trim()
                }
                $success = $true
            } catch {
                $retries++
                $waitSec = $retries * 3
                Start-Sleep -Seconds $waitSec
            }
        }
        if (-not $success) { 
            Write-Host "  WARNING: Failed batch $start..$($end-1)"
            for ($i = 0; $i -lt $batchItems.Count; $i++) { $results += "" }
        }
        Start-Sleep -Milliseconds 600
    }
    
    return $results
}

function Translate-Chapter($srcPath, $dstPath, $chapterName) {
    Write-Host "`nProcessing $chapterName..."
    
    $data = Read-Utf8Json $srcPath
    $count = $data.Count
    Write-Host "  Questions: $count"
    
    $questions = @(); $optA = @(); $optB = @(); $optC = @(); $optD = @(); $explanations = @()
    
    foreach ($q in $data) {
        $questions += $q.question
        $optA += $q.options.A
        $optB += $q.options.B
        $optC += $q.options.C
        $optD += $q.options.D
        $explanations += $q.explanation
    }
    
    Write-Host "  Translating questions..."
    $transQuestions = Get-BnTranslation $questions
    Write-Host "  Translating option A..."
    $transOptA = Get-BnTranslation $optA
    Write-Host "  Translating option B..."
    $transOptB = Get-BnTranslation $optB
    Write-Host "  Translating option C..."
    $transOptC = Get-BnTranslation $optC
    Write-Host "  Translating option D..."
    $transOptD = Get-BnTranslation $optD
    Write-Host "  Translating explanations..."
    $transExplanations = Get-BnTranslation $explanations
    
    $englishQuestions = @()
    for ($i = 0; $i -lt $count; $i++) {
        $eq = New-Object PSObject
        $eq | Add-Member -MemberType NoteProperty -Name "id" -Value $data[$i].id
        $eq | Add-Member -MemberType NoteProperty -Name "question" -Value $(if ($i -lt $transQuestions.Count -and $transQuestions[$i] -ne "") { $transQuestions[$i] } else { $data[$i].question })
        $opts = New-Object PSObject
        $opts | Add-Member -MemberType NoteProperty -Name "A" -Value $(if ($i -lt $transOptA.Count -and $transOptA[$i] -ne "") { $transOptA[$i] } else { $data[$i].options.A })
        $opts | Add-Member -MemberType NoteProperty -Name "B" -Value $(if ($i -lt $transOptB.Count -and $transOptB[$i] -ne "") { $transOptB[$i] } else { $data[$i].options.B })
        $opts | Add-Member -MemberType NoteProperty -Name "C" -Value $(if ($i -lt $transOptC.Count -and $transOptC[$i] -ne "") { $transOptC[$i] } else { $data[$i].options.C })
        $opts | Add-Member -MemberType NoteProperty -Name "D" -Value $(if ($i -lt $transOptD.Count -and $transOptD[$i] -ne "") { $transOptD[$i] } else { $data[$i].options.D })
        $eq | Add-Member -MemberType NoteProperty -Name "options" -Value $opts
        $eq | Add-Member -MemberType NoteProperty -Name "answer" -Value $data[$i].answer
        $eq | Add-Member -MemberType NoteProperty -Name "explanation" -Value $(if ($i -lt $transExplanations.Count -and $transExplanations[$i] -ne "") { $transExplanations[$i] } else { $data[$i].explanation })
        $eq | Add-Member -MemberType NoteProperty -Name "source" -Value $data[$i].source
        $englishQuestions += $eq
    }
    
    $dstDir = Split-Path $dstPath -Parent
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
    
    Write-Utf8Json $dstPath $englishQuestions
    Write-Host "  Written to $dstPath"
}

# === MAIN ===
$baseDir = "C:\Users\User\OneDrive\Documents\80-20 exam\public\hsc"

Write-Host "=== Translating social_1st to English ==="
for ($i = 1; $i -le 9; $i++) {
    $src = "$baseDir\social_1st\chapter_$i.json"
    $dst = "$baseDir\social_1st\english\chapter_$i.json"
    if (Test-Path $src) {
        Translate-Chapter $src $dst "social_1st chapter_$i"
    }
}

Write-Host "`n=== DONE ==="
