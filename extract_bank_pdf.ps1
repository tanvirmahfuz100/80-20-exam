[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $PdfPath,
    [string] $ExamName,
    [string] $OutputDir = "public/bank",
    [int] $StartPage = 1,
    [int] $EndPage = 0
)

# ── Tool paths ──
$popplerDir = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"
$env:Path = "$popplerDir;$env:Path"
$env:Path = "C:\Program Files\Tesseract-OCR;$env:Path"

$encoding = [System.Text.Encoding]::UTF8
$bnToEn = @{ "ক" = "A"; "খ" = "B"; "গ" = "C"; "ঘ" = "D" }

function Clean-OptionText($t) {
    $t = $t -replace '(?is)Ans[\.:\s]*[A-D].*$', ''
    $t = $t -replace '(?s)সঠিক উত্তর.*$', ''
    $t = $t -replace '(?s)উত্তর.*$', ''
    $t = $t -replace '(?m)^[কখগঘ][\.\),]\s*', ''
    $t = $t -replace '^[A-Da-d][\.\)]\s*', ''
    $t = $t -replace '(?m)^[০-৯]{1,2}\.\s*', ''
    $t = $t -replace '[\r\n]+', ' '
    $t = $t -replace '\s+', ' '
    $t = $t -replace '^[?.]\s*', ''
    $t = $t -replace '[?\*]\.[?\*].*$', ''
    return $t.Trim()
}
function Clean-QuestionText($t) {
    $t = $t -replace '^\|?\s*', ''
    $t = $t -replace '\s*\|\s*$', ''
    $t = $t -replace '[\r\n]+', ' '
    $t = $t -replace '\s+', ' '
    return $t.Trim()
}

# ── Detect PDF info ──
$totalPages = 0
try {
    $pdfInfoLines = & pdfinfo $PdfPath 2>$null
    if ($pdfInfoLines) {
        $pdfInfoText = ($pdfInfoLines -join "`n")
        if ($pdfInfoText -match 'Pages:\s+(\d+)') { $totalPages = [int]$matches[1] }
    }
} catch { }
if ($EndPage -eq 0 -or $EndPage -gt $totalPages) { $EndPage = $totalPages }

Write-Host "PDF: $PdfPath ($totalPages pages, scanning $StartPage-$EndPage)"
if ($totalPages -eq 0) { Write-Host "ERROR: Could not read PDF" -ForegroundColor Red; exit 1 }

# ── Step 1: Try text extraction first ──
$tmpText = [System.IO.Path]::GetTempFileName()
& pdftotext -layout -nopgbrk $PdfPath $tmpText 2>$null
$rawText = ""
if (Test-Path $tmpText) {
    $rawText = [System.IO.File]::ReadAllText($tmpText, $encoding)
}
Remove-Item $tmpText -ErrorAction SilentlyContinue

# Check if text has actual question content (Ans:, A./B./C./D. patterns)
$hasMcqContent = $rawText -match '(?s)Ans[:\s]*[A-D]' -or $rawText -match '(?s)[A-Dক-ঘ]\.\s.*[A-Dক-ঘ]\.\s.*[A-Dক-ঘ]\.\s.*[A-Dক-ঘ]\.'
$isScanned = ($rawText.Trim().Length -lt 100) -or -not $hasMcqContent
if (-not $isScanned) {
    Write-Host "Text-based PDF detected ($($rawText.Length) chars)"
    $allText = $rawText
} else {
    Write-Host "Scanned PDF detected — OCR'ing pages $StartPage-$EndPage..."
    $tmpDir = Join-Path $env:TEMP "pdf_extract_$(Get-Random)"
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    # Process each page in parallel: pdftoppm + tesseract per page
    Write-Host "  OCR'ing $($EndPage - $StartPage + 1) pages (6 parallel)..."
    $pages = $StartPage..$EndPage
    $results = $pages | ForEach-Object -Parallel {
        $page = $_
        $tmpDir = $using:tmpDir
        $pdf = $using:PdfPath
        $padded = $page.ToString('000')

        & "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftoppm.exe" -r 200 -jpeg -f $page -l $page $pdf (Join-Path $tmpDir "p") 2>$null
        $imgFile = Join-Path $tmpDir "p-$padded.jpg"
        $txtFile = Join-Path $tmpDir "p-$padded.txt"
        & "C:\Program Files\Tesseract-OCR\tesseract.exe" $imgFile (Join-Path $tmpDir "p-$padded") -l ben+eng --psm 6 2>$null
        if (Test-Path $txtFile) {
            $text = Get-Content $txtFile -Encoding UTF8 -Raw
            if ($text.Trim().Length -gt 20) { Write-Host "  [Page $page] OK ($($text.Trim().Length)c)"; return $text }
        }
        Write-Host "  [Page $page] SKIP (empty)"
        return ""
    } -ThrottleLimit 6

    $allText = ($results | Where-Object { $_ -ne "" }) -join "`n"
    Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
    $extracted = @($results | Where-Object { $_ -ne "" }).Count
    Write-Host "  OCR done: $extracted pages with text, $($results.Count - $extracted) empty"
}

if ([string]::IsNullOrWhiteSpace($allText)) {
    Write-Host "ERROR: No text extracted" -ForegroundColor Red; exit 1
}

# ── Step 2: Clean text ──
$allText = $allText -replace '(?m)^.*www\.exambd\.net.*$', ''
$allText = $allText -replace '(?m)^Page\s+\d+.*$', ''
$allText = $allText -replace '(?m)^\s*২০০০ \+.*$', ''
$allText = $allText -replace '(?m)^\s*डाउनलोড.*$', ''
$allText = $allText -replace '(?m)^\s*Download Menu.*$', ''
$allText = $allText -replace '(?m)^\s*উপরে.*$', ''
$allText = $allText -replace '(?m)^\s*চাকরি.*$', ''
$allText = $allText -replace '[\x00-\x08\x0B\x0C\x0E-\x1F]', ''
$allText = ($allText -split '\r?\n' | Where-Object { $_.Trim().Length -gt 1 }) -join "`n"

# ── Step 3: Parse questions ──
$questions = @()
$nextId = 1

# Split into blocks at each question number (ASCII + Bengali digits)
$blocks = [regex]::Split($allText, '(?m)^(?=\d{1,3}\.\s|[০-৯]{1,2}\.\s)')
$blocks = $blocks | Where-Object { $_.Trim().Length -gt 30 }

Write-Host "Found $($blocks.Count) potential question blocks"

foreach ($block in $blocks) {
    $block = $block.Trim()
    if ($block.Length -lt 30) { continue }

    $qText = ""
    $opts = @{}
    $answer = $null

    $block -match '^(\d{1,3}|[০-৯]{1,2})[\.\)]\s*' | Out-Null
    if ($matches) {
        $block = $block -replace '^(\d{1,3}|[০-৯]{1,2})[\.\)]\s*', ''
    }

    # Try English + Bengali option markers
    $optRe = '(?s)(?:A|a|ক)[\.\)]\s*(.*?)(?:B|b|খ)[\.\)]\s*(.*?)(?:C|c|গ)[\.\)]\s*(.*?)(?:D|d|ঘ)[\.\)]\s*(.*)'
    $aMatch = [regex]::Match($block, $optRe)
    if (-not $aMatch.Success) {
        # Safe garbled fallback: common OCR-mangled markers
        $optRe = '(?s)(?:A|a|ক|[?\*#])[\.\)\s,]\s*(.*?)(?:B|b|খ|[?\*#])[\.\)\s,]\s*(.*?)(?:C|c|গ|[?\*#])[\.\)\s,]\s*(.*?)(?:D|d|ঘ|[?\*#])[\.\)\s,]\s*(.*)'
        $aMatch = [regex]::Match($block, $optRe)
    }
    if ($aMatch.Success) {
        $opts['A'] = Clean-OptionText $aMatch.Groups[1].Value
        $opts['B'] = Clean-OptionText $aMatch.Groups[2].Value
        $opts['C'] = Clean-OptionText $aMatch.Groups[3].Value
        $rest = $aMatch.Groups[4].Value
        $opts['D'] = Clean-OptionText $rest
        $qText = $block.Substring(0, $aMatch.Index)
        $qText = Clean-QuestionText $qText

        # Find answer — try multiple patterns
        $ansPatterns = @(
            '(?i)Ans[\.:\s]*([A-D])',
            'সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])',
            'সঠিক উত্তর[ঃ:\s]*([ক-ঘ])',
            'উত্তর[ঃ:\s]*([ক-ঘ])',
            '(?i)[?\*]\.[?\*]\s*([A-Dক-ঘ])'  # ?.? X  garbled answer marker
        )
        foreach ($ap in $ansPatterns) {
            if ($rest -match $ap -or $block -match $ap) {
                $letter = $matches[1].Trim()
                if ($bnToEn.ContainsKey($letter)) { $answer = $bnToEn[$letter] }
                elseif ($letter -match '[A-D]') { $answer = $letter }
                break
            }
        }
    }

    if ($qText -and $qText.Length -gt 5 -and $opts.Count -eq 4 -and $answer) {
        $questions += [PSCustomObject]@{
            id = $nextId
            question = $qText
            options = [Ordered]@{
                'A' = if ($opts['A']) { $opts['A'] } else { '' }
                'B' = if ($opts['B']) { $opts['B'] } else { '' }
                'C' = if ($opts['C']) { $opts['C'] } else { '' }
                'D' = if ($opts['D']) { $opts['D'] } else { '' }
            }
            answer = $answer
            source = $ExamName
        }
        $nextId++
    }
}

# ── Step 4: Post-process — clean OCR noise from Bengali question options ──
function Clean-Noise($t) {
    $t = $t -replace '(?i)[BCDFGHJKLMNPQRSTVWXYZ]{3,}', ' '
    $t = $t -replace '(?i)\b[a-z]{4,}\b', ' '
    $t = $t -replace '<[^>]+>', ''
    $t = $t -replace '\s+', ' '
    return $t.Trim()
}
$cleaned = 0
foreach ($q in $questions) {
    $isBangla = $q.question -match '[ক-ঘ]'
    if (-not $isBangla) { continue }
    $cleaned++
    foreach ($k in @('A','B','C','D')) {
        $q.options.$k = Clean-Noise $q.options.$k
    }
}
if ($cleaned -gt 0) { Write-Host "  Cleaned $cleaned Bengali questions" }

# ── Step 5: Output ──
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
$outFile = Join-Path $OutputDir "$ExamName.json"
$json = $questions | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($outFile, $json, $encoding)
Write-Host "Wrote $($questions.Count) questions to $outFile" -ForegroundColor Green
