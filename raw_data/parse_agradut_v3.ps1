# parse_agradut_v3.ps1 - Efficient MCQ extraction

param(
    [string]$InputFile = "raw_data/agradut_raw.txt",
    [string]$OutputDir = "public/bank"
)

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

$content = [System.IO.File]::ReadAllText((Resolve-Path $InputFile), [System.Text.Encoding]::UTF8)
Write-Host "Read $($content.Length) chars"

function Remove-ExtraWhitespace { param([string]$s) ($s -replace '\s+', ' ').Trim() }
function HtmlDecode { param([string]$s) [System.Net.WebUtility]::HtmlDecode($s) }

# ---------------------------------------------------------------
# Step 1: Find exam boundaries  
# ---------------------------------------------------------------
$examStarts = @()
foreach ($m in [regex]::Matches($content, 'অগ্রদূত\s+Recent\s+Job\s+Solution')) {
    $pos = $m.Index + $m.Length
    $len = [Math]::Min(200, $content.Length - $pos)
    $la = $content.Substring($pos, $len)
    if ($la -match 'সময়\s*:' -or $la -match 'পদের\s+নাম\s*:') {
        $examStarts += $m.Index
    }
}

$sorted = $examStarts | Sort-Object
$cleanStarts = @()
$last = -1000
foreach ($s in $sorted) { if ($s - $last -gt 200) { $cleanStarts += $s; $last = $s } }

Write-Host "Found $($cleanStarts.Count) exam sections"

$examSections = @()
for ($i = 0; $i -lt $cleanStarts.Count; $i++) {
    $start = $cleanStarts[$i]
    $end = if ($i -lt $cleanStarts.Count - 1) { $cleanStarts[$i+1] } else { $content.Length }
    $sectionText = $content.Substring($start, $end - $start)
    
    $hlen = [Math]::Min(400, $sectionText.Length)
    $h = Remove-ExtraWhitespace ($sectionText.Substring(0, $hlen) -replace "`r|`n"," ")
    
    $examName = ""; $examDate = ""
    $m1 = [regex]::Match($h, '(?:মিনিট|Minutes)\s+(.+?)(?:\s+পদের নাম|\s+পূর্ণমান|\s+পরীক্ষার|\s+Based|\s+Post Name|\s*же$)')
    if ($m1.Success -and $m1.Groups[1].Value.Trim().Length -gt 3) { $examName = Remove-ExtraWhitespace $m1.Groups[1].Value }
    if ([string]::IsNullOrEmpty($examName)) {
        $m2 = [regex]::Match($h, '(সমন্বিত\s+[\d০১১২২৩৩৪৪৫৫৬৬৭৭৮৮৯৯]+\s+ব্যাংক[^প]*?)(?:\s+পদের|\s*$)')
        if ($m2.Success) { $examName = Remove-ExtraWhitespace $m2.Groups[1].Value }
    }
    if ($h -match 'তারিখ:\s*([\d./]+)') { $examDate = $matches[1] }
    
    # Count markers to determine format
    $bengaliAnsCount = [regex]::Matches($sectionText, 'উ\.?\s*[কখগঘ]').Count
    $engAnsCount = [regex]::Matches($sectionText, 'Ans:\s*[ABCD]').Count
    $bengaliDigitsCount = [regex]::Matches($sectionText, '[০১২৩৪৫৬৭৮৯]').Count
    
    $format = if ($engAnsCount -gt $bengaliAnsCount) { "english" } else { "bengali" }
    
    $examSections += @{
        Index=$i; Start=$start; End=$end; Length=$end-$start
        Header=$h; ExamName=$examName; ExamDate=$examDate; Format=$format
        Text=$sectionText; BengAnswers=$bengaliAnsCount; EngAnswers=$engAnsCount
    }
    
    $dn = if ($examName.Length -gt 60) { $examName.Substring(0,60)+"..." } else { $examName }
    Write-Host "  [$i] $dn ($examDate) fmt=$format bengAns=$bengaliAnsCount engAns=$engAnsCount len=$($sectionText.Length)"
}

# ---------------------------------------------------------------
# Step 2: Parse questions using answer markers as anchors
# ---------------------------------------------------------------
$b2e = @{'ক'='A';'খ'='B';'গ'='C';'ঘ'='D'}
$allQuestions = @()
$examIndex = @()

foreach ($section in $examSections) {
    $text = $section.Text
    $examName = if ($section.ExamName) { Remove-ExtraWhitespace "$($section.ExamName) ($($section.ExamDate))" } else { "Exam $($section.Index)" }
    if ($section.ExamDate -eq "") { $examName = $section.ExamName }
    $format = $section.Format
    
    Write-Host "`n=== [$($section.Index)] $examName ==="
    
    # Find answer markers (both Bengali and English formats)
    $allAnswers = @()
    
    if ($format -eq "english") {
        foreach ($m in [regex]::Matches($text, 'Ans:\s*([ABCD])\s*')) {
            $allAnswers += @{ Index=$m.Index; Letter=$m.Groups[1].Value; Type="eng" }
        }
    } else {
        foreach ($m in [regex]::Matches($text, 'উ\.?\s*([কখগঘ])')) {
            $allAnswers += @{ Index=$m.Index; Letter=$b2e[$m.Groups[1].Value]; Type="bng" }
        }
    }
    
    # Also add English answers if present in Bengali format sections
    if ($format -eq "bengali") {
        foreach ($m in [regex]::Matches($text, 'Ans:\s*([ABCD])\s*')) {
            $allAnswers += @{ Index=$m.Index; Letter=$m.Groups[1].Value; Type="eng" }
        }
    }
    
    # Sort by position
    $allAnswers = $allAnswers | Sort-Object Index
    
    Write-Host "  Found $($allAnswers.Count) answer markers"
    
    $questions = @()
    $bnDigitRegex = '[০১২৩৪৫৬৭৮৯]'
    
    for ($i = 0; $i -lt $allAnswers.Count; $i++) {
        $ans = $allAnswers[$i]
        
        # Determine block boundaries: from previous answer end (or text start) to current answer end
        $prevAnsEnd = if ($i -gt 0) { $allAnswers[$i-1].Index + 10 } else { 0 }
        $blockStart = [Math]::Max(0, $prevAnsEnd)
        $blockEnd = $ans.Index + if ($format -eq "english") { 8 } else { 6 }
        
        if ($blockStart -ge $blockEnd) { continue }
        if ($blockStart -ge $text.Length - 1 -or $blockEnd -gt $text.Length) { continue }
        
        $block = $text.Substring($blockStart, $blockEnd - $blockStart)
        
        # Extract question number (last occurrence of a number at start)
        $qNum = ""; $qText = ""
        
        # Find the last question number in the block
        $numPats = @()
        if ($format -eq "bengali") {
            # Bengali numbers like ১. ২. or Arabic 1. 2.
            $numPats = @('(?s).*?([০১২৩৪৫৬৭৮৯]+)\s*\.\s*(?=[^.]*$)', '(?s).*?(\d+)\s*\.\s*(?=[^.]*$)')
        } else {
            $numPats = @('(?s).*?(\d+)\s*\.\s*(?=[^.]*$)')
        }
        
        $bestQMatch = $null
        foreach ($np in $numPats) {
            $m = [regex]::Match($block, $np)
            if ($m.Success) { $bestQMatch = $m; break }
        }
        
        if ($bestQMatch -and $bestQMatch.Success) {
            $qNum = [int]($bestQMatch.Groups[1].Value -replace '[^\d]', '')
            # Extract question text between number and options
            $qStart = $block.LastIndexOf($bestQMatch.Groups[1].Value + '.')
            if ($qStart -ge 0) {
                $afterQ = $qStart + $bestQMatch.Groups[1].Value.Length + 1
                $rawQText = $block.Substring($afterQ)
                
                # Strip options from question text
                if ($format -eq "bengali") {
                    $opSplit = [regex]::Match($rawQText, '(.*?)(?=ক\.|খ\.|গ\.|ঘ\.|উ\.|পৃষ্ঠা:|$)')
                    if ($opSplit.Success) { $qText = Remove-ExtraWhitespace $opSplit.Groups[1].Value }
                } else {
                    # For English format, remove the answer itself
                    $opSplit = [regex]::Match($rawQText, '(.*?)(?=A\.|B\.|C\.|D\.|Ans:|পৃষ্ঠা:|$)')
                    if ($opSplit.Success) { $qText = Remove-ExtraWhitespace $opSplit.Groups[1].Value }
                }
                
                if ([string]::IsNullOrEmpty($qText)) { $qText = Remove-ExtraWhitespace ($rawQText -replace 'Ans:\s*[ABCD]', '') }
            }
        }
        
        if ([string]::IsNullOrEmpty($qNum)) { continue }
        if ([string]::IsNullOrEmpty($qText)) { continue }
        
        # Extract options from the block
        $options = [Ordered]@{}
        if ($format -eq "bengali") {
            $optLetters = @('ক','খ','গ','ঘ')
            $optKeys = @('A','B','C','D')
            for ($oi = 0; $oi -lt 4; $oi++) {
                $ol = $optLetters[$oi]
                # Find value between this option prefix and next option/answer/page ref
                $optStart = $block.IndexOf("$ol.")
                if ($optStart -ge 0) {
                    $afterOpt = $optStart + 2
                    $nextOpts = $optLetters | Where-Object { $_ -ne $ol } | ForEach-Object { "$_. " }
                    $nextOpts += @('উ.',' পৃষ্ঠা:','Ans:')
                    $nextOptPat = '（' + (($nextOpts | ForEach-Object { [regex]::Escape($_) }) -join '|') + '）'
                    $nextMM = [regex]::Match($block.Substring($afterOpt), "(.*?)(?=$nextOptPat)")
                    $optVal = if ($nextMM.Success) { Remove-ExtraWhitespace $nextMM.Groups[1].Value } else { Remove-ExtraWhitespace $block.Substring($afterOpt) }
                    if ($optVal) { $options[$optKeys[$oi]] = $optVal }
                }
            }
        } else {
            foreach ($ol in @('A','B','C','D')) {
                $optStart = [regex]::Match($block, "(?s)$([regex]::Escape($ol))\.\s*(.*?)(?=(?:[ABCD]\.|Ans:| পৃষ্ঠা:|$))")
                if ($optStart.Success) {
                    $optVal = Remove-ExtraWhitespace $optStart.Groups[1].Value
                    if ($optVal -and $optVal.Length -lt 500) { $options[$ol] = $optVal }
                }
            }
        }
        
        # Extract explanation (English format only)
        $explanation = ""
        if ($format -eq "english") {
            # Look forward from answer for ব্যাখ্যা: or Explanation:
            $lookFwdLen = [Math]::Min(5000, $text.Length - $ans.Index)
            $fwdText = $text.Substring($ans.Index, $lookFwdLen)
            $expMatch = [regex]::Match($fwdText, '(?:Ans:\s*[ABCD]\s*)(.*?)(?=\d+\s*\.\s*[A-Z]|\d+\s*\.\s*[ক-ঘ]|পৃষ্ঠা:\s*\d|$)')
            if ($expMatch.Success) {
                $expRaw = $expMatch.Groups[1].Value
                if ($expRaw -match '^(?:ব্যাখ্যা|Explanation):\s*(.*)') {
                    $explanation = Remove-ExtraWhitespace $matches[1]
                } elseif ($expRaw.Length -gt 20) {
                    $explanation = Remove-ExtraWhitespace $expRaw
                }
            }
        }
        
        $questions += @{
            id = $qNum
            question = $qText
            options = $options
            answer = $ans.Letter
            explanation = $explanation
        }
    }
    
    Write-Host "  Extracted $($questions.Count) questions"
    
    if ($questions.Count -gt 0) {
        $examIndex += @{ examName=$examName; count=$questions.Count; format=$format }
        
        $safeName = $examName -replace '[^\w\s-]','' -replace '\s+','_'
        $safeName = $safeName.Substring(0, [Math]::Min(80, $safeName.Length))
        $outFile = Join-Path $OutputDir "agradut_$($section.Index)_$safeName.json"
        
        $questions | ConvertTo-Json -Depth 10 | Out-File $outFile -Encoding utf8
        Write-Host "  -> $outFile"
        $allQuestions += $questions
    }
}

Write-Host "`n=== Done: $($allQuestions.Count) total questions ==="
Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

$combinedFile = Join-Path $OutputDir "agradut_combined.json"
$allQuestions | ConvertTo-Json -Depth 10 | Out-File $combinedFile -Encoding utf8

$indexFile = Join-Path $OutputDir "agradut_index.json"
$examIndex | ConvertTo-Json -Depth 3 | Out-File $indexFile -Encoding utf8
Write-Host "Combined: $combinedFile"
Write-Host "Index: $indexFile"
