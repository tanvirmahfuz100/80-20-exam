param(
    [string]$HtmlFile = "C:\Users\User\.local\share\opencode\tool-output\tool_ef3523515001Nvmtxs9gOXWlHw",
    [string]$OutputJson = "public/ssc/accounting/chapter_wise.json"
)

[Console]::OutputEncoding = [Text.Encoding]::UTF8
$html = [System.IO.File]::ReadAllText($HtmlFile, [System.Text.Encoding]::UTF8)

function Get-CardBlocks($html, $startPos = 0) {
    $blocks = [System.Collections.ArrayList]@()
    $searchPos = $startPos
    
    while ($true) {
        $classPos = $html.IndexOf('class="card card-bordered', $searchPos)
        if ($classPos -lt 0) { break }
        
        # Find opening <
        $openPos = $classPos
        for ($i = $classPos - 1; $i -ge 3; $i--) {
            if ($html[$i] -eq '<') {
                if ($i + 4 -le $html.Length) {
                    $after = $html.Substring($i, 5)
                    if ($after -like '<div*' -or $after -like '<div>*') {
                        $openPos = $i
                        break
                    }
                }
            }
        }
        if ($openPos -eq $classPos) { $searchPos = $classPos + 5; continue }
        
        $tagEnd = $html.IndexOf('>', $classPos)
        if ($tagEnd -lt 0) { break }
        
        $pos = $tagEnd + 1
        $depth = 1
        while ($depth -gt 0 -and $pos -lt $html.Length) {
            $nextOpen = $html.IndexOf('<div', $pos)
            $nextClose = $html.IndexOf('</div>', $pos)
            if ($nextClose -lt 0) { break }
            if ($nextOpen -ge 0 -and $nextOpen -lt $nextClose) { $depth++; $pos = $nextOpen + 5 }
            else { $depth--; $pos = $nextClose + 6 }
        }
        
        $blockHtml = $html.Substring($openPos, $pos - $openPos)
        [void]$blocks.Add(@{ Html = $blockHtml; EndPos = $pos })
        $searchPos = $pos
    }
    
    return $blocks
}

function Extract-QuestionText($cardHtml) {
    $qsMatch = [regex]::Match($cardHtml, '(?s)<span class="question-span[^"]*"[^>]*>(.*?)</span>')
    if (-not $qsMatch.Success) { return "" }
    $inner = $qsMatch.Groups[1].Value
    $inner = [System.Net.WebUtility]::HtmlDecode($inner)
    $inner = $inner -replace '<br\s*/?>', "`n"
    $inner = $inner -replace '<[^>]+>', ''
    $inner = $inner -replace '^\s*\d+\s*\.\s*', ''
    return $inner.Trim()
}

function Extract-PassageText($cardHtml) {
    $text = ""
    $titleMatch = [regex]::Match($cardHtml, '(?s)<h2 class="card-title[^"]*"[^>]*>(.*?)</h2>')
    if ($titleMatch.Success) {
        $t = [System.Net.WebUtility]::HtmlDecode($titleMatch.Groups[1].Value)
        $t = $t -replace '<[^>]+>', ' '
        $text += $t.Trim()
    }
    $bodyMatch = [regex]::Match($cardHtml, '(?s)class="text-dark fs-4 text-justify lh-base"[^>]*>(.*?)</div>')
    if ($bodyMatch.Success) {
        $b = [System.Net.WebUtility]::HtmlDecode($bodyMatch.Groups[1].Value)
        $b = $b -replace '<[^>]+>', ' '
        if ($text) { $text += "`n" }
        $text += $b.Trim()
    }
    return ($text -replace '\s+', ' ').Trim()
}

function Extract-Options($cardHtml) {
    $opts = [Ordered]@{}
    $correctLetter = $null

    $readingStart = $cardHtml.IndexOf('reading-mode-data')
    if ($readingStart -lt 0) { return $opts, $correctLetter }
    $readingSection = $cardHtml.Substring($readingStart)
    
    $labels = [regex]::Matches($readingSection, '(?s)<label for="kkradio_option(\d+)_(\d+)"[^>]*>(.*?)</label>')
    
    foreach ($label in $labels) {
        $optNum = [int]$label.Groups[1].Value
        $labelText = $label.Groups[3].Value
        
        $optText = [System.Net.WebUtility]::HtmlDecode($labelText)
        $optText = $optText -replace '<[^>]+>', ''
        $optText = $optText.Trim()
        $optText = $optText -replace '^[ক-ঘ][)\.]\s*', ''
        $optText = $optText.Trim()
        
        $letter = switch ($optNum) { 1 { "A" } 2 { "B" } 3 { "C" } 4 { "D" } }
        $opts[$letter] = $optText
    }
    
    $successIdx = $readingSection.IndexOf('fa-check-circle sa-success')
    if ($successIdx -ge 0) {
        # Search FORWARD from success marker to find the nearest label (same option block)
        $searchForward = $readingSection.Substring($successIdx)
        $nextLabel = [regex]::Match($searchForward, '(?s)<label for="kkradio_option(\d+)_\d+"')
        if ($nextLabel.Success) {
            $n = [int]$nextLabel.Groups[1].Value
            $correctLetter = switch ($n) { 1 { "A" } 2 { "B" } 3 { "C" } 4 { "D" } }
        }
    }
    
    if (-not $correctLetter) {
        $hiddenMatch = [regex]::Match($cardHtml, 'name="answer" value="(\d)"')
        if ($hiddenMatch.Success) {
            $n = [int]$hiddenMatch.Groups[1].Value
            $correctLetter = switch ($n) { 1 { "A" } 2 { "B" } 3 { "C" } 4 { "D" } }
        }
    }
    
    return $opts, $correctLetter
}

function Is-PassageContainer($cardHtml) {
    $classMatch = [regex]::Match($cardHtml, 'class="card card-bordered([^"]*)"')
    $classes = $classMatch.Groups[1].Value.Trim()
    return $classes -eq "mb-5"
}

function Process-Cards($cards, $passageText = "") {
    $result = @()
    $currentPassage = $passageText
    $qid = 0
    
    foreach ($cardInfo in $cards) {
        $cardHtml = $cardInfo.Html
        
        if (Is-PassageContainer $cardHtml) {
            # Extract passage text
            $pt = Extract-PassageText $cardHtml
            
            # Recursively extract sub-questions from within the card-body
            $bodyStart = $cardHtml.IndexOf('card-body')
            if ($bodyStart -ge 0) {
                $bodyContent = $cardHtml.Substring($bodyStart)
                # Find sub-questions inside this passage
                $subCards = Get-CardBlocks $bodyContent
                if ($subCards.Count -gt 0) {
                    $subResults = Process-Cards $subCards $pt
                    # Filter out passage containers (shouldn't have nested passages)
                    foreach ($sr in $subResults) {
                        $result += $sr
                    }
                }
            }
        } else {
            # Question card
            $qText = Extract-QuestionText $cardHtml
            $opts, $correct = Extract-Options $cardHtml
            
            $fullText = if ($currentPassage) { "$currentPassage`n`n$qText" } else { $qText }
            
            $result += [PSCustomObject]@{
                id = 0  # Will be renumbered
                question = $fullText
                options = $opts
                answer = $correct
                source = "স্যাট একাডেমি"
            }
        }
    }
    
    return $result
}

# Main extraction
$allCards = Get-CardBlocks $html
Write-Host "Found $($allCards.Count) card blocks"

$questions = Process-Cards $allCards

# Renumber
for ($i = 0; $i -lt $questions.Count; $i++) {
    $questions[$i].id = $i + 1
}

$json = $questions | ConvertTo-Json -Depth 3
$outputPath = [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($MyInvocation.MyCommand.Path), $OutputJson)
$dir = Split-Path $outputPath -Parent
if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
[System.IO.File]::WriteAllText($outputPath, $json, [System.Text.Encoding]::UTF8)
Write-Host "Extracted $($questions.Count) questions to $outputPath"
