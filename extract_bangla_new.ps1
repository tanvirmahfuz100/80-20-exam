[Console]::OutputEncoding = [Text.Encoding]::UTF8
$encoding = [System.Text.Encoding]::UTF8

$htmlDir = "D:\Tanvir Mahfuz\80-20-exam\docs\web\ssc-bangla-2nd"
$outputDir = "D:\Tanvir Mahfuz\80-20-exam\public\ssc\bangla"
$mappingFile = "D:\Tanvir Mahfuz\80-20-exam\file_mapping.json"

$bnToEn = @{ "ক" = "A"; "খ" = "B"; "গ" = "C"; "ঘ" = "D" }
$enLetters = @("A", "B", "C", "D")

$fileMapping = Get-Content -LiteralPath $mappingFile -Encoding UTF8 -Raw | ConvertFrom-Json

function Get-QuestionsFromHtml {
    param([string]$html, [string]$boardName)
    $questions = @()
    $nextId = 1
    $searchPos = 0
    while ($true) {
        $blockStart = $html.IndexOf('<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5', $searchPos)
        if ($blockStart -lt 0) { break }
        $nextBlock = $html.IndexOf('<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5', $blockStart + 5)
        if ($nextBlock -lt 0) { $nextBlock = $html.Length }
        $blockHtml = $html.Substring($blockStart, $nextBlock - $blockStart)
        $hasSub = $blockHtml.Contains('space-y-6')
        $qTextStart = $blockHtml.IndexOf('font-medium text-card-foreground')
        if ($qTextStart -lt 0) { $searchPos = $blockStart + 5; continue }
        $qTextStart = $blockHtml.IndexOf('>', $qTextStart) + 1
        $qTextEnd = $blockHtml.IndexOf('</div></div>', $qTextStart)
        if ($qTextEnd -le $qTextStart) { $searchPos = $blockStart + 5; continue }
        $qTextHtml = $blockHtml.Substring($qTextStart, $qTextEnd - $qTextStart)
        $mainQuestion = Get-TextFromHtml -html $qTextHtml
        if ([string]::IsNullOrWhiteSpace($mainQuestion)) { $searchPos = $blockStart + 5; continue }
        if ($hasSub) {
            $subSectionStart = $blockHtml.IndexOf('space-y-6')
            if ($subSectionStart -ge 0) {
                $subSectionStart = $blockHtml.IndexOf('<div class="space-y-6', $subSectionStart)
                if ($subSectionStart -ge 0) {
                    $subSectionEnd = $blockHtml.IndexOf('</div></div>', $subSectionStart)
                    if ($subSectionEnd -ge 0) {
                        for ($i = 0; $i -lt 10; $i++) {
                            $nextEnd = $blockHtml.IndexOf('</div></div>', $subSectionEnd + 12)
                            if ($nextEnd -ge 0 -and ($nextEnd - $subSectionEnd) -lt 30) { $subSectionEnd = $nextEnd }
                            else { break }
                        }
                        $subSectionHtml = $blockHtml.Substring($subSectionStart, $subSectionEnd - $subSectionStart + 14)
                        $subPos = 0
                        while ($true) {
                            $subDivStart = $subSectionHtml.IndexOf('<div class="px-4 pt-4 pb-6 border rounded-xl', $subPos)
                            if ($subDivStart -lt 0) { break }
                            $subDivEnd = $subSectionHtml.IndexOf('</div></div>', $subDivStart)
                            if ($subDivEnd -lt 0) { break }
                            $subHtml = $subSectionHtml.Substring($subDivStart, $subDivEnd - $subDivStart + 14)
                            $sqStart = $subHtml.IndexOf('font-medium text-card-foreground')
                            if ($sqStart -ge 0) {
                                $sqStart = $subHtml.IndexOf('>', $sqStart) + 1
                                $sqEnd = $subHtml.IndexOf('</div></div>', $sqStart)
                                if ($sqEnd -gt $sqStart) {
                                    $sqHtml = $subHtml.Substring($sqStart, $sqEnd - $sqStart)
                                    $subQText = Get-TextFromHtml -html $sqHtml
                                    if (![string]::IsNullOrWhiteSpace($subQText)) {
                                        $fullText = $mainQuestion + " " + $subQText
                                        $qObj = Get-Options -blockHtml $subHtml -questionText $fullText -qid $nextId
                                        if ($qObj) { $questions += $qObj; $nextId++ }
                                    }
                                }
                            }
                            $subPos = $subDivEnd + 14
                        }
                    }
                }
            }
        } else {
            $qObj = Get-Options -blockHtml $blockHtml -questionText $mainQuestion -qid $nextId
            if ($qObj) { $questions += $qObj; $nextId++ }
        }
        $searchPos = $blockStart + 5
    }
    return $questions
}

function Get-TextFromHtml {
    param([string]$html)
    $parts = @()
    $p = 0
    while ($true) {
        $tagStart = $html.IndexOf('<p', $p)
        if ($tagStart -lt 0) { break }
        $tagEnd = $html.IndexOf('>', $tagStart) + 1
        if ($tagEnd -le 0) { $p = $tagStart + 1; continue }
        $close = $html.IndexOf('</p>', $tagEnd)
        if ($close -lt 0) { $p = $tagStart + 1; continue }
        $text = $html.Substring($tagEnd, $close - $tagEnd)
        $decoded = [System.Net.WebUtility]::HtmlDecode($text)
        if (![string]::IsNullOrWhiteSpace($decoded)) {
            $decoded = $decoded -replace '^\d+[\.\)]\s*', ''
            $parts += $decoded.Trim()
        }
        $p = $close + 4
    }
    return ($parts -join ' ')
}

function Get-Options {
    param([string]$blockHtml, [string]$questionText, [int]$qid)
    $gridIdx = $blockHtml.IndexOf('grid grid-cols-1 gap-2 md:grid-cols-2')
    if ($gridIdx -lt 0) { return $null }
    $contentStart = $blockHtml.IndexOf('>', $gridIdx) + 1
    if ($contentStart -le 0) { return $null }
    $letters = @()
    $texts = @()
    $correctIdx = -1
    $btnPos = $contentStart
    $btnIndex = 0
    while ($true) {
        $btnStart = $blockHtml.IndexOf('<button', $btnPos)
        if ($btnStart -lt 0 -or $btnStart -gt $contentStart + 12000) { break }
        $btnEnd = $blockHtml.IndexOf('</button>', $btnStart)
        if ($btnEnd -lt 0) { break }
        $btnSlice = $blockHtml.Substring($btnStart, $btnEnd - $btnStart + 9)
        $spanStart = $btnSlice.IndexOf('<span')
        if ($spanStart -ge 0) {
            $spanStart = $btnSlice.IndexOf('>', $spanStart) + 1
            $spanEnd = $btnSlice.IndexOf('</span>', $spanStart)
            if ($spanEnd -gt $spanStart) {
                $letters += $btnSlice.Substring($spanStart, $spanEnd - $spanStart).Trim()
            } else { $letters += "" }
        } else { $letters += "" }
        $btnText = ""
        $flexPos = $btnSlice.IndexOf('flex-1')
        if ($flexPos -ge 0) {
            $pStart = $btnSlice.IndexOf('<p', $flexPos)
            if ($pStart -ge 0) {
                $pStart = $btnSlice.IndexOf('>', $pStart) + 1
                $pEnd = $btnSlice.IndexOf('</p>', $pStart)
                if ($pEnd -gt $pStart) {
                    $raw = $btnSlice.Substring($pStart, $pEnd - $pStart)
                    $btnText = [System.Net.WebUtility]::HtmlDecode($raw).Trim()
                }
            }
        }
        $texts += $btnText
        if ($btnSlice -match 'bg-\[#017A471A\]') {
            $correctIdx = $btnIndex
        }
        $btnIndex++
        $btnPos = $btnEnd + 9
    }
    if ($correctIdx -lt 0 -and $letters.Count -gt 0) {
        try {
            $ansMatch = [regex]::Match($blockHtml, 'সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong[^>]*>([ক-ঘ])')
            if ($ansMatch.Success) {
                $bnL = $ansMatch.Groups[1].Value
                for ($i = 0; $i -lt $letters.Count; $i++) {
                    if ($letters[$i] -eq $bnL) { $correctIdx = $i; break }
                }
            }
        } catch { }
    }
    if ($texts.Count -lt 2) { return $null }
    $opts = [Ordered]@{}
    for ($i = 0; $i -lt [Math]::Min($texts.Count, 4); $i++) {
        $opts[$enLetters[$i]] = $texts[$i]
    }
    if ($correctIdx -lt 0) { $correctIdx = 0 }
    return @{
        id = $qid
        question = $questionText
        options = $opts
        answer = $enLetters[$correctIdx]
        source = $boardName
    }
}

$total = 0
$errors = @()
$mappingLines = @()

foreach ($num in ($fileMapping.PSObject.Properties.Name | Sort-Object { [int]$_ })) {
    $htmlName = $fileMapping.$num
    $htmlPath = Join-Path $htmlDir $htmlName
    Write-Host "Processing #$num : $htmlName ... " -NoNewline
    try {
        $content = [System.IO.File]::ReadAllText($htmlPath, $encoding)
        $boardMatch = [regex]::Match($content, '<h1 class="header">([^<]+)</h1>')
        if (!$boardMatch.Success) { Write-Host "NO BOARD" -ForegroundColor Yellow; continue }
        $boardName = $boardMatch.Groups[1].Value
        $questions = Get-QuestionsFromHtml -html $content -boardName $boardName
        if ($questions.Count -eq 0) { Write-Host "NO QUESTIONS" -ForegroundColor Yellow; continue }
        $json = $questions | ConvertTo-Json -Depth 3
        $outFile = Join-Path $outputDir "$num.json"
        [System.IO.File]::WriteAllText($outFile, $json, $encoding)
        $total += $questions.Count
        $mappingLines += "$num.json|$($questions.Count)|$boardName"
        Write-Host "$($questions.Count) q - OK" -ForegroundColor Green
    }
    catch {
        Write-Host "ERR: $_" -ForegroundColor Red
        $errors += "$htmlName : $_"
    }
}

Write-Host "`n=== Generation complete: $total questions ===" -ForegroundColor Cyan
Write-Host "`n--- Mapping to add to _mapping.txt ---" -ForegroundColor Yellow
$mappingLines | ForEach-Object { Write-Host $_ }
if ($errors.Count -gt 0) { $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red } }