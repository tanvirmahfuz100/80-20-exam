# parse_agradut_v2.ps1 - Extract MCQ questions from অগ্রদূত Recent Job Solution text

param(
    [string]$InputFile = "raw_data/agradut_raw.txt",
    [string]$OutputDir = "public/bank",
    [switch]$Debug
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$sw = [System.Diagnostics.Stopwatch]::StartNew()

# Read entire file
$content = [System.IO.File]::ReadAllText((Resolve-Path $InputFile), [System.Text.Encoding]::UTF8)
Write-Host "Read $($content.Length) chars from $InputFile"

function Remove-ExtraWhitespace { param([string]$s) ($s -replace '\s+', ' ').Trim() }
function HtmlDecodeBangla { param([string]$s) [System.Net.WebUtility]::HtmlDecode($s) }

# ---------------------------------------------------------------
# Step 1: Find exam boundaries
# ---------------------------------------------------------------
# Real exam starts have "অগ্রদূত Recent Job Solution" followed by exam metadata
$examStarts = @()
$allMatches = [regex]::Matches($content, 'অগ্রদূত\s+Recent\s+Job\s+Solution')

foreach ($m in $allMatches) {
    $pos = $m.Index + $m.Length
    $lookaheadLen = [Math]::Min(200, $content.Length - $pos)
    $lookahead = $content.Substring($pos, $lookaheadLen)
    # Check if followed by exam metadata (সময়: or পদের নাম: or time pattern)
    if ($lookahead -match 'সময়\s*:' -or $lookahead -match 'পদের\s+নাম\s*:') {
        $examStarts += $m.Index
    }
}

# Sort and deduplicate (remove starts that are within 200 chars of each other, keep first)
$sorted = $examStarts | Sort-Object
$cleanStarts = @()
$last = -1000
foreach ($s in $sorted) {
    if ($s - $last -gt 200) {
        $cleanStarts += $s
        $last = $s
    }
}

Write-Host "Found $($cleanStarts.Count) exam sections"

# Extract each exam section
$examSections = @()
for ($i = 0; $i -lt $cleanStarts.Count; $i++) {
    $start = $cleanStarts[$i]
    $end = if ($i -lt $cleanStarts.Count - 1) { $cleanStarts[$i+1] } else { $content.Length }
    $sectionText = $content.Substring($start, $end - $start)
    
    # Extract header info from first 400 chars
    $headerLen = [Math]::Min(400, $sectionText.Length)
    $headerText = ($sectionText.Substring(0, $headerLen) -replace "`r|`n", " ")
    $headerText = Remove-ExtraWhitespace $headerText
    
    # Parse exam name and date from header
    $examName = ""
    $examDate = ""
    
    # Try multiple patterns for exam name
    $pat1 = [regex]::Match($headerText, '(?:মিনিট|Minutes)\s+(.+?)(?:\s+পদের নাম|\s+পূর্ণমান|\s+পরীক্ষার|\s+Based|\s+Post Name|\s*$)')
    if ($pat1.Success -and $pat1.Groups[1].Value.Trim().Length -gt 3) {
        $examName = Remove-ExtraWhitespace $pat1.Groups[1].Value
    }
    
    # Try English pattern
    if ([string]::IsNullOrEmpty($examName)) {
        $pat2 = [regex]::Match($headerText, '(?:Based\s+)?Post\s+Name:\s*(.+?)(?:\s+Written\s+Exam|\s+Facebook|\s+পরীক্ষার|\s*$)')
        if ($pat2.Success) { $examName = Remove-ExtraWhitespace $pat2.Groups[1].Value }
    }
    
    # Try to get exam name from the "সমন্বিত" or "Combined" part
    if ([string]::IsNullOrEmpty($examName)) {
        $pat3 = [regex]::Match($headerText, '(সমন্বিত\s+[\d০১২৩৪৫৬৭৮৯]+\s+ব্যাংক[^প]*?)(?:\s+পদের|\s*$)')
        if ($pat3.Success) { $examName = Remove-ExtraWhitespace $pat3.Groups[1].Value }
    }
    
    # Extract date
    if ($headerText -match 'তারিখ:\s*([\d./]+)') {
        $examDate = $matches[1]
    } elseif ($headerText -match 'Date:\s*([\d./]+)') {
        $examDate = $matches[1]
    }
    
    # Determine format
    $hasBengaliNumbers = $sectionText -match '[০১২৩৪৫৬৭৮৯]'
    $hasEnglishAns = $sectionText -match 'Ans:\s*[ABCD]'
    
    $format = "unknown"
    if ($hasEnglishAns) { $format = "english" }
    elseif ($hasBengaliNumbers) { $format = "bengali" }
    
    $examSections += @{
        Index = $i
        Start = $start
        End = $end
        Length = $end - $start
        Header = $headerText
        ExamName = if ([string]::IsNullOrEmpty($examName)) { "Exam $i" } else { $examName }
        ExamDate = $examDate
        Format = $format
        Text = $sectionText
    }
    
    $dispName = if ($examName.Length -gt 60) { $examName.Substring(0, 60) + "..." } else { $examName }
    Write-Host "  [$i] $dispName ($examDate) format=$format len=$($sectionText.Length)"
}

# ---------------------------------------------------------------
# Step 2: Parse each section
# ---------------------------------------------------------------

$bengaliDigits = @{'০'='0';'১'='1';'২'='2';'৩'='3';'৪'='4';'৫'='5';'৬'='6';'৭'='7';'৮'='8';'৯'='9'}
function NormalizeDigits {
    param([string]$s)
    $sb = [System.Text.StringBuilder]::new()
    foreach ($ch in $s.ToCharArray()) {
        if ($bengaliDigits.ContainsKey($ch)) { $null = $sb.Append($bengaliDigits[$ch]) }
        else { $null = $sb.Append($ch) }
    }
    return $sb.ToString()
}

function Extract-Questions-By-Answer {
    <#
    .DESCRIPTION
    Strategy: Find answer markers, then work backwards to find question/options.
    #>
    param([string]$text, [string]$examName, [string]$format)
    
    $questions = @()
    
    if ($format -eq "english") {
        $ansPattern = 'Ans:\s*([ABCD])\s*'
    } else {
        $ansPattern = 'উ\.?\s*([কখগঘ])'
    }
    
    $ansMatches = [regex]::Matches($text, $ansPattern)
    Write-Host "  Found $($ansMatches.Count) answer markers"
    
    $ansMapB2E = @{ 'ক'='A'; 'খ'='B'; 'গ'='C'; 'ঘ'='D' }
    
    for ($i = 0; $i -lt $ansMatches.Count; $i++) {
        $m = $ansMatches[$i]
        $ansLetter = $m.Groups[1].Value
        
        if ($format -eq "english") {
            $answer = $ansLetter
        } else {
            $answer = $ansMapB2E[$ansLetter]
        }
        
        # Determine the answer marker start
        $ansEnd = $m.Index + $m.Length
        $ansStart = $m.Index
        
        # Look for question number before this answer
        # Find the last occurrence of a question number before this position
        $preText = $text.Substring(0, $ansStart)
        
        # Find question number
        $qNum = ""
        $qText = ""
        $options = @{}
        
        if ($format -eq "english") {
            $qMatch = [regex]::Match($preText, '(?:^|\s)(\d+)\s*\.\s*(?!\d)(?=[^.]*$)')
            if (-not $qMatch.Success) {
                $qMatch = [regex]::Match($preText, '(?:^|[\s)])(\d+)\s*\.\s*(?=[A-Z])')
            }
        } else {
            # Bengali numbers
            $normalized = NormalizeDigits($preText)
            $qMatch = [regex]::Match($normalized, '(?:^|\s)(\d+)\s*\.\s*(?=[^.]*$)')
            if (-not $qMatch.Success) {
                $qMatch = [regex]::Match($normalized, '(?:^|\s)(\d+)\s*\.\s*(.+)')
            }
        }
        
        if ($qMatch.Success) {
            $qNum = $qMatch.Groups[1].Value
            # Extract question text - from after the number to before options
            $qnStart = $preText.LastIndexOf($qMatch.Groups[1].Value + ".")
            if ($qnStart -ge 0) {
                $qnAfter = $qnStart + $qMatch.Groups[1].Value.Length + 1
                $qnTextRaw = $preText.Substring($qnAfter)
                
                # Extract text before options
                if ($format -eq "english") {
                    $optSplit = [regex]::Match($qnTextRaw, '(.*?)(?=A\.|B\.|C\.|D\.|Ans:)')
                    if ($optSplit.Success) { $qText = Remove-ExtraWhitespace $optSplit.Groups[1].Value }
                    else { $qText = Remove-ExtraWhitespace $qnTextRaw }
                } else {
                    $optSplit = [regex]::Match($qnTextRaw, '(.*?)(?=ক\.|খ\.|গ\.|ঘ\.|উ\.)')
                    if ($optSplit.Success) { $qText = Remove-ExtraWhitespace $optSplit.Groups[1].Value }
                    else { $qText = Remove-ExtraWhitespace $qnTextRaw }
                }
            }
        }
        
        # Extract options - search between question and answer
        $blockEnd = $ansStart
        $blockStart = if ($qMatch.Success) { $qnStart } else { 0 }
        $blockText = if ($blockStart -lt $blockEnd -and $blockStart -ge 0) { $text.Substring($blockStart, $blockEnd - $blockStart) } else { "" }
        
        $optOrder = @('A','B','C','D')
        $optPatterns = @()
        if ($format -eq "english") {
            $optPatterns = @('A\.\s*', 'B\.\s*', 'C\.\s*', 'D\.\s*')
        } else {
            $optPatterns = @('ক\.\s*', 'খ\.\s*', 'গ\.\s*', 'ঘ\.\s*')
        }
        
        for ($oi = 0; $oi -lt 4; $oi++) {
            $optPattern = $optPatterns[$oi]
            $nextPatterns = @()
            for ($ni = $oi+1; $ni -lt 4; $ni++) { $nextPatterns += $optPatterns[$ni] }
            $nextPatterns += if ($format -eq "english") { 'Ans:' } else { 'উ\.|পৃষ্ঠা:' }
            
            $lookahead = "(?=$($nextPatterns -join '|'))"
            $fullPat = "(?s)($optPattern)(.*?)$lookahead"
            $om = [regex]::Match($blockText, $fullPat)
            
            if ($om.Success) {
                $optVal = Remove-ExtraWhitespace $om.Groups[2].Value
                $options[$optOrder[$oi]] = $optVal
            }
        }
        
        # Extract explanation (for English format only)
        $explanation = ""
        if ($format -eq "english") {
            $expMatch = [regex]::Match($text.Substring($ansStart), '(?:Ans:\s*[ABCD]\s*)(.*?)(?=(?:\d+\s*\.|পৃষ্ঠা:|$))')
            if ($expMatch.Success) {
                # Check if starts with ব্যাখ্যা: or Explanation:
                $expText = Remove-ExtraWhitespace $expMatch.Groups[1].Value
                if ($expText -match '^(ব্যাখ্যা|Explanation):\s*(.*)') {
                    $explanation = Remove-ExtraWhitespace $matches[2]
                } else {
                    $explanation = $expText
                }
            }
        }
        
        if ($qNum -ne "" -or $qText -ne "" -or $options.Count -gt 0) {
            $questions += @{
                id = $qNum
                question = $qText
                options = $options
                answer = $answer
                explanation = $explanation
            }
        }
    }
    
    return $questions
}

# ---------------------------------------------------------------
# Process all sections
# ---------------------------------------------------------------

$allQuestions = @()
$examIndex = @()

foreach ($section in $examSections) {
    $text = $section.Text
    $examName = $section.ExamName
    $examDate = $section.ExamDate
    $format = $section.Format
    
    $fullExamName = Remove-ExtraWhitespace "$examName ($examDate)"
    if ($examDate -eq "") { $fullExamName = $examName }
    
    Write-Host "`n=== Processing [$($section.Index)] $fullExamName ==="
    
    $sectionQs = Extract-Questions-By-Answer -text $text -examName $fullExamName -format $format
    
    Write-Host "  Extracted $($sectionQs.Count) questions"
    
    if ($sectionQs.Count -gt 0) {
        $examIndex += @{
            examName = $fullExamName
            count = $sectionQs.Count
            format = $format
            index = $section.Index
        }
        
        # Save individual file
        $safeName = $fullExamName -replace '[^\w\s-]', '' -replace '\s+', '_'
        $safeName = $safeName.Substring(0, [Math]::Min(80, $safeName.Length))
        $outFile = Join-Path $OutputDir "agradut_$($section.Index)_$safeName.json"
        
        $sectionQs | ConvertTo-Json -Depth 10 | Out-File -FilePath $outFile -Encoding utf8
        Write-Host "  -> Saved to $outFile"
        
        $allQuestions += $sectionQs
    }
}

Write-Host "`n============================================"
Write-Host "Total questions extracted: $($allQuestions.Count)"
Write-Host "Exam sections: $($examIndex.Count)"
Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

$combinedFile = Join-Path $OutputDir "agradut_combined.json"
$allQuestions | ConvertTo-Json -Depth 10 | Out-File -FilePath $combinedFile -Encoding utf8
Write-Host "Combined -> $combinedFile"

$indexFile = Join-Path $OutputDir "agradut_index.json"
$examIndex | ConvertTo-Json -Depth 3 | Out-File -FilePath $indexFile -Encoding utf8
Write-Host "Index -> $indexFile"
