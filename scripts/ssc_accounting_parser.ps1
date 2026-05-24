param(
    [string]$SourceDir = "D:\Tanvir Mahfuz\80-20-exam\docs\web\ssc-accounting",
    [string]$OutDir = "D:\Tanvir Mahfuz\80-20-exam\public\ssc\accounting"
)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$bnLetters = @([char]0x0995, [char]0x0996, [char]0x0997, [char]0x0998)
$enLetters = @("A", "B", "C", "D")

function Decode-Text {
    param([string]$T)
    $t = [System.Net.WebUtility]::HtmlDecode($T)
    $t = [regex]::Replace($t, '<[^>]+>', ' ')
    $t = [regex]::Replace($t, '\s+', ' ').Trim()
    $t = $t -replace '&amp;', '&' -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&#39;', "'"
    return $t
}

function Extract-PTexts {
    param([string]$Section)
    $parts = @()
    $matches = [regex]::Matches($Section, '(?s)<p[^>]*>(.*?)</p>')
    foreach ($m in $matches) {
        $t = Decode-Text $m.Groups[1].Value
        if ($t -and $t.Length -gt 0) { $parts += $t }
    }
    return ($parts -join ' ') -replace '\s+', ' '
}

function Get-QuestionText {
    param([string]$Block)
    $m = [regex]::Match($Block, '(?s)text-card-foreground[^>]*><div[^>]*>((?:(?!</div></div>).)*)</div></div>')
    if ($m.Success) {
        $t = Extract-PTexts $m.Groups[1].Value
        if ($t -and $t.Length -gt 1) {
            # Remove leading number like "1. " or "7. "
            $t = $t -replace '^\d+\.\s*', ''
            if ($t.Length -gt 1) { return $t }
        }
    }
    return ""
}

function Get-Options {
    param([string]$Block, [ref]$AnswerRef)
    $options = [Ordered]@{}
    $ansLetter = ""
    $correctBG = 'bg-\[#017A471A\]|bg-\[\#017A47\]'
    
    # Find options grid start
    $gridStart = $Block.IndexOf('grid grid-cols-1 gap-2')
    if ($gridStart -lt 0) { $AnswerRef.Value = ""; return @{} }
    
    # Collect all button start positions after grid
    $btnStarts = New-Object System.Collections.ArrayList
    $pos = $gridStart
    while ($true) {
        $pos = $Block.IndexOf('<button', $pos)
        if ($pos -lt 0) { break }
        $btnStarts.Add($pos) | Out-Null
        $pos++
        if ($btnStarts.Count -ge 10) { break }
    }
    if ($btnStarts.Count -eq 0) { $AnswerRef.Value = ""; return @{} }
    
    # Extract each button's content by finding its matching </button>
    $btnIdx = 0
    foreach ($bStart in $btnStarts) {
        if ($btnIdx -ge 4) { break }
        $en = $enLetters[$btnIdx]
        $btnIdx++
        
        $bEnd = $Block.IndexOf('</button>', $bStart)
        if ($bEnd -lt 0) { continue }
        $btnContent = $Block.Substring($bStart, $bEnd - $bStart + 9)
        if ($btnContent.Length -lt 20) { continue }
        
        # Extract option text from last <p> in the button (skip empty leading <p>)
        $pMatches = [regex]::Matches($btnContent, '(?s)<p[^>]*>(.*?)</p>')
        $optText = ""
        foreach ($pm in $pMatches) {
            $t = Decode-Text $pm.Groups[1].Value
            if ($t -and $t.Length -gt 0) { $optText = $t }
        }
        
        if ($optText -ne "" -and $optText.Length -gt 0) {
            $options[$en] = $optText
            if ($btnContent -match $correctBG) {
                $ansLetter = $en
            }
        }
    }
    
    # Fallback: extract answer from text like "সঠিক উত্তর: ক)" or "সঠিক উত্তর হলো <strong>খ)"
    if ($ansLetter -eq "") {
        $txtMatch = [regex]::Match($Block, 'সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])')
        if ($txtMatch.Success) {
            $ch = $txtMatch.Groups[1].Value
            for ($i = 0; $i -lt 4; $i++) {
                if ($ch -eq $bnLetters[$i]) {
                    $ansLetter = $enLetters[$i]
                    break
                }
            }
        }
    }
    
    $AnswerRef.Value = $ansLetter
    return $options
}

function Process-File {
    param([string]$FilePath, [string]$BoardId, [string]$BoardName)
    
    Write-Host "Processing $BoardName..."
    $html = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
    
    $questions = @()
    $qId = 1
    
    $blocks = [regex]::Split($html, '(?=<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5)')
    
    foreach ($block in $blocks) {
        if ($block.Trim().Length -eq 0) { continue }
        if ($block -notmatch 'rounded-xl p-5') { continue }
        
        # Check for sub-question group (space-y-6)
        if ($block -match '<div class="space-y-6') {
            $parentText = Get-QuestionText $block
            # Remove leading number from parent text
            $parentText = $parentText -replace '^\d+\.\s*', ''
            
            $subBlocks = [regex]::Split($block, '(?=<div class="px-4 pt-4 pb-6 border rounded-xl)')
            foreach ($sb in $subBlocks) {
                if ($sb.Trim().Length -eq 0) { continue }
                if ($sb -notmatch 'rounded-xl') { continue }
                
                $subText = Get-QuestionText $sb
                if ($subText -eq "") { continue }
                
                $fullText = if ($parentText) { "$parentText - $subText" } else { $subText }
                
                $correct = ""
                $opts = Get-Options $sb -AnswerRef ([ref]$correct)
                if ($opts.Keys.Count -ge 2) {
                    $questions += @{ id = $qId; question = $fullText; options = $opts; answer = $correct; source = $BoardName }
                    $qId++
                }
            }
        } else {
            $questionText = Get-QuestionText $block
            if ($questionText -eq "") { continue }
            
            $correct = ""
            $opts = Get-Options $block -AnswerRef ([ref]$correct)
            if ($opts.Keys.Count -ge 2) {
                $questions += @{ id = $qId; question = $questionText; options = $opts; answer = $correct; source = $BoardName }
                $qId++
            } else {
                Write-Host "  WARN: Only $($opts.Keys.Count) options for Q$qId"
            }
        }
    }
    
    Write-Host "  -> $($questions.Count) questions"
    return $questions
}

# Board mapping by file basename suffix
$boardMap = @{
    "unnumbered" = @{ Id = "board_dhaka_2026"; Name = "ঢাকা বোর্ড ২০২৬" }
    "1"  = @{ Id = "board_barishal_2026"; Name = "বরিশাল বোর্ড ২০২৬" }
    "3"  = @{ Id = "board_jashore_2026"; Name = "যশোর বোর্ড ২০২৬" }
    "4"  = @{ Id = "board_cumilla_2026"; Name = "কুমিল্লা বোর্ড ২০২৬" }
    "5"  = @{ Id = "board_rajshahi_2026"; Name = "রাজশাহী বোর্ড ২০২৬" }
    "6"  = @{ Id = "board_chattogram_2026"; Name = "চট্টগ্রাম বোর্ড ২০২৬" }
    "7"  = @{ Id = "board_dinajpur_2026"; Name = "দিনাজপুর বোর্ড ২০২৬" }
    "8"  = @{ Id = "board_sylhet_2026"; Name = "সিলেট বোর্ড ২০২৬" }
    "9"  = @{ Id = "board_mymensingh_2026"; Name = "ময়মনসিংহ বোর্ড ২০২৬" }
    "10" = @{ Id = "board_dhaka_2025"; Name = "ঢাকা বোর্ড ২০২৫" }
    "11" = @{ Id = "board_rajshahi_2025"; Name = "রাজশাহী বোর্ড ২০২৫" }
    "12" = @{ Id = "board_mymensingh_2025"; Name = "ময়মনসিংহ বোর্ড ২০২৫" }
    "13" = @{ Id = "board_sylhet_2025"; Name = "সিলেট বোর্ড ২০২৫" }
    "14" = @{ Id = "board_cumilla_2025"; Name = "কুমিল্লা বোর্ড ২০২৫" }
    "15" = @{ Id = "board_jashore_2025"; Name = "যশোর বোর্ড ২০২৫" }
    "16" = @{ Id = "board_chattogram_2025"; Name = "চট্টগ্রাম বোর্ড ২০২৫" }
    "17" = @{ Id = "board_dinajpur_2025"; Name = "দিনাজপুর বোর্ড ২০২৫" }
    "18" = @{ Id = "board_barishal_2025"; Name = "বরিশাল বোর্ড ২০২৫" }
    "19" = @{ Id = "board_dhaka_2024"; Name = "ঢাকা বোর্ড ২০২৪" }
    "20" = @{ Id = "board_mymensingh_2024"; Name = "ময়মনসিংহ বোর্ড ২০২৪" }
    "21" = @{ Id = "board_rajshahi_2024"; Name = "রাজশাহী বোর্ড ২০২৪" }
    "22" = @{ Id = "board_dinajpur_2024"; Name = "দিনাজপুর বোর্ড ২০২৪" }
    "23" = @{ Id = "board_cumilla_2024"; Name = "কুমিল্লা বোর্ড ২০২৪" }
    "24" = @{ Id = "board_chattogram_2024"; Name = "চট্টগ্রাম বোর্ড ২০২৪" }
    "25" = @{ Id = "board_sylhet_2024"; Name = "সিলেট বোর্ড ২০২৪" }
    "26" = @{ Id = "board_jashore_2024"; Name = "যশোর বোর্ড ২০২৪" }
    "27" = @{ Id = "board_barishal_2024"; Name = "বরিশাল বোর্ড ২০২৪" }
    "28" = @{ Id = "board_mymensingh_2023"; Name = "ময়মনসিংহ বোর্ড ২০২৩" }
    "29" = @{ Id = "board_rajshahi_2023"; Name = "রাজশাহী বোর্ড ২০২৩" }
    "30" = @{ Id = "board_dinajpur_2023"; Name = "দিনাজপুর বোর্ড ২০২৩" }
    "31" = @{ Id = "board_cumilla_2023"; Name = "কুমিল্লা বোর্ড ২০২৩" }
    "32" = @{ Id = "board_chattogram_2023"; Name = "চট্টগ্রাম বোর্ড ২০২৩" }
    "33" = @{ Id = "board_chattogram_2023_2"; Name = "চট্টগ্রাম বোর্ড ২০২৩ (২য় সেট)" }
    "34" = @{ Id = "board_sylhet_2023"; Name = "সিলেট বোর্ড ২০২৩" }
    "35" = @{ Id = "board_jashore_2023"; Name = "যশোর বোর্ড ২০২৩" }
    "36" = @{ Id = "board_barishal_2023"; Name = "বরিশাল বোর্ড ২০২৩" }
    "37" = @{ Id = "board_dhaka_2022"; Name = "ঢাকা বোর্ড ২০২২" }
    "38" = @{ Id = "board_mymensingh_2022"; Name = "ময়মনসিংহ বোর্ড ২০২২" }
    "39" = @{ Id = "board_rajshahi_2022"; Name = "রাজশাহী বোর্ড ২০২২" }
    "40" = @{ Id = "board_dinajpur_2022"; Name = "দিনাজপুর বোর্ড ২০২২" }
    "41" = @{ Id = "board_cumilla_2022"; Name = "কুমিল্লা বোর্ড ২০২২" }
    "42" = @{ Id = "board_chattogram_2022"; Name = "চট্টগ্রাম বোর্ড ২০২২" }
    "43" = @{ Id = "board_sylhet_2022"; Name = "সিলেট বোর্ড ২০২২" }
    "44" = @{ Id = "board_jashore_2022"; Name = "যশোর বোর্ড ২০২২" }
    "45" = @{ Id = "board_barishal_2022"; Name = "বরিশাল বোর্ড ২০২২" }
}

$files = @(Get-ChildItem -Path $SourceDir -Filter "*.html" | Where-Object { $_.Name -notlike '*_files*' })

foreach ($file in $files) {
    $m = [regex]::Match($file.BaseName, '(\d+)$')
    $idx = if ($m.Success) { $m.Groups[1].Value } else { "unnumbered" }
    
    $meta = $boardMap[$idx]
    if (-not $meta) { Write-Host "No mapping for index '$idx' ($($file.Name))"; continue }
    
    $questions = Process-File -FilePath $file.FullName -BoardId $meta.Id -BoardName $meta.Name
    if ($questions.Count -gt 0) {
        $jsonPath = Join-Path $OutDir "$($meta.Id).json"
        $jsonStr = $questions | ConvertTo-Json -Depth 4
        [System.IO.File]::WriteAllText($jsonPath, $jsonStr, [System.Text.Encoding]::UTF8)
        Write-Host "  Saved: $($meta.Id).json"
    }
}

Write-Host "`n=== SUMMARY ==="
$total = 0
foreach ($kv in $boardMap.Keys) {
    $meta = $boardMap[$kv]
    $fpath = Join-Path $OutDir "$($meta.Id).json"
    if (Test-Path $fpath) {
        $jsonStr = [System.IO.File]::ReadAllText($fpath, [System.Text.Encoding]::UTF8)
        $qCount = 0
        try {
            $parsed = $jsonStr | ConvertFrom-Json
            $qCount = $parsed.Count
        } catch {
            $qCount = ($jsonStr.Split('"id":').Length - 1)
        }
        Write-Host "$($meta.Name): $qCount questions"
        $total += $qCount
    }
}
Write-Host "Total: $total questions"
