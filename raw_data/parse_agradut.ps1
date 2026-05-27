# parse_agradut.ps1 - Extract MCQ questions from অগ্রদূত Recent Job Solution text

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

# ---------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------

function Remove-ExtraWhitespace {
    param([string]$s)
    # Collapse multiple spaces, remove leading/trailing whitespace
    $s = $s -replace '\s+', ' '
    return $s.Trim()
}

function HtmlDecodeBangla {
    param([string]$s)
    # HTML decode just in case
    return [System.Net.WebUtility]::HtmlDecode($s)
}

# ---------------------------------------------------------------
# Step 1: Split the content into exam sections
# ---------------------------------------------------------------
# Exam header patterns (in order of specificity)
$headerPatterns = @(
    '(?s)(অগ্রদূত\s+Recent\s+Job\s+Solution.*?)(?=অগ্রদূত\s+Recent\s+Job\s+Solution|$)',  # Full header
    '(?s)(সমন্বিত\s+\d+\s+ব্যাংক.*?)(?=সমন্বিত\s+\d+\s+ব্যাংক|$)',  # Bengali header
    '(?s)(Combined\s+\d+\s+Bank.*?)(?=Combined\s+\d+\s+Bank|$)',  # English header
    '(?s)(ম্যাট্রিক্স.*?)(?=ম্যাট্রিক্স|$)'  # Matrix series
)

# Find all "অগ্রদূত Recent Job Solution" occurrences as primary exam separators
$examStarts = [regex]::Matches($content, 'অগ্রদূত\s+Recent\s+Job\s+Solution')
Write-Host "Found $($examStarts.Count) exam sections"

# Extract each exam section
$examSections = @()
for ($i = 0; $i -lt $examStarts.Count; $i++) {
    $start = $examStarts[$i].Index
    $end = if ($i -lt $examStarts.Count - 1) { $examStarts[$i+1].Index } else { $content.Length }
    $sectionText = $content.Substring($start, $end - $start)
    
    # Extract header info (first ~300 chars)
    $headerLen = [Math]::Min(300, $sectionText.Length)
    $headerText = $sectionText.Substring(0, $headerLen) -replace "`r|`n", " "
    $headerText = Remove-ExtraWhitespace $headerText
    
    $examSections += @{
        Index = $i
        Start = $start
        End = $end
        Length = $end - $start
        Header = $headerText
        Text = $sectionText
    }
    
    if ($Debug) {
        Write-Host "  Section $i : start=$start len=$($end-$start)"
        $displayHeader = $headerText.Substring(0, [Math]::Min(120, $headerText.Length))
        Write-Host "    Header: $displayHeader"
    }
}

Write-Host "Extracted $($examSections.Count) exam sections"

# ---------------------------------------------------------------
# Step 2: Parse each section for questions
# ---------------------------------------------------------------

function Convert-BengaliNumber {
    param([string]$s)
    $map = @{
        '০' = '0'; '১' = '1'; '২' = '2'; '৩' = '3'; '৪' = '4'
        '৫' = '5'; '৬' = '6'; '৭' = '7'; '৮' = '8'; '৯' = '9'
    }
    $result = [System.Text.StringBuilder]::new()
    foreach ($ch in $s.ToCharArray()) {
        if ($map.ContainsKey($ch)) { $null = $result.Append($map[$ch]) }
        else { $null = $result.Append($ch) }
    }
    return $result.ToString()
}

function Extract-Questions-Bengali {
    param([string]$sectionText, [string]$examName)
    
    $questions = @()
    
    # Strategy: Find all Bengali numbered questions
    # Match pattern: সংখ্যা. question text
    # Bengali digits: ০১২৩৪৫৬৭৮৯
    
    # First, try to match numbered questions with Bengali digits
    $qPattern = '(?s)([০১২৩৪৫৬৭৮৯]+)\.\s*([^ক]*?)(?=(?:[০১২৩৪৫৬৭৮৯]+\.\s*[^ক]|$))'
    
    # Actually, the pattern is more complex because options start with ক.
    # Let's try a different approach
    
    # Find all question number positions
    $numMatches = [regex]::Matches($sectionText, '(?<=^|\s)([০১২৩৪৫৬৭৮৯]+)\s*\.\s*(?=[^\d])')
    
    if ($numMatches.Count -eq 0) {
        # Try Arabic digits
        $numMatches = [regex]::Matches($sectionText, '(?<=^|\s)(\d+)\s*\.\s*(?=[^\d])')
    }
    
    Write-Host "  Found $($numMatches.Count) question numbers in '$examName'"
    
    for ($i = 0; $i -lt $numMatches.Count; $i++) {
        $qStart = $numMatches[$i].Index
        $qNum = $numMatches[$i].Groups[1].Value
        $afterNum = $numMatches[$i].Index + $numMatches[$i].Length
        
        # Find next question start
        $qEnd = if ($i -lt $numMatches.Count - 1) { $numMatches[$i+1].Index } else { $sectionText.Length }
        
        # Extract question block
        $qBlock = $sectionText.Substring($qStart, $qEnd - $qStart)
        
        # Extract question text (from after number to before options)
        $optMatch = [regex]::Match($qBlock, '(?s)([০১২৩৪৫৬৭৮৯]+\.\s*)(.*?)(?=ক\.|খ\.|গ\.|ঘ\.|A\.|B\.|C\.|D\.)')
        
        $questionText = ""
        $options = @{}
        $answer = ""
        
        if ($optMatch.Success) {
            $questionText = Remove-ExtraWhitespace $optMatch.Groups[2].Value
        }
        
        # Find options in order
        $optOrder = @('ক', 'খ', 'গ', 'ঘ')
        $optLetters = @('A', 'B', 'C', 'D')
        $optTexts = @()
        
        for ($oi = 0; $oi -lt 4; $oi++) {
            $bn = $optOrder[$oi]
            $pat = '(?s)' + [regex]::Escape($bn) + '\.\s*([^।]*?(?=(?:[কখগঘ]\.|উ\.|পৃষ্ঠা:|$)))'
            $m = [regex]::Match($qBlock, $pat)
            if ($m.Success) {
                $optText = Remove-ExtraWhitespace $m.Groups[1].Value
                $optTexts += $optText
            } else {
                $optTexts += ""
            }
        }
        
        # Find answer
        $ansMatch = [regex]::Match($qBlock, 'উ\.\s*([কখগঘ])')
        if ($ansMatch.Success) {
            $ansLetter = $ansMatch.Groups[1].Value
            $ansMap = @{ 'ক' = 'A'; 'খ' = 'B'; 'গ' = 'C'; 'ঘ' = 'D' }
            $answer = $ansMap[$ansLetter]
        }
        
        if ($questionText -ne "" -or $optTexts -join "" -ne "") {
            $questions += @{
                id = $qNum
                question = $questionText
                options = $optTexts
                answer = $answer
            }
        }
    }
    
    return $questions
}

function Extract-Questions-English {
    param([string]$sectionText, [string]$examName)
    
    $questions = @()
    
    # Find Arabic numbered questions
    $numMatches = [regex]::Matches($sectionText, '(?<=^|\s)(\d+)\s*\.\s*(?=[^\d])')
    
    Write-Host "  Found $($numMatches.Count) English-style question numbers in '$examName'"
    
    for ($i = 0; $i -lt $numMatches.Count; $i++) {
        $qStart = $numMatches[$i].Index
        $qNum = $numMatches[$i].Groups[1].Value
        $afterNum = $numMatches[$i].Index + $numMatches[$i].Length
        
        $qEnd = if ($i -lt $numMatches.Count - 1) { $numMatches[$i+1].Index } else { $sectionText.Length }
        $qBlock = $sectionText.Substring($qStart, $qEnd - $qStart)
        
        # Extract question text
        $qTextMatch = [regex]::Match($qBlock, '(?s)(\d+\.\s*)(.*?)(?=(?:A\.|B\.|C\.|D\.|Ans:|$))')
        $questionText = ""
        if ($qTextMatch.Success) {
            $questionText = Remove-ExtraWhitespace $qTextMatch.Groups[2].Value
        }
        
        # Extract options A, B, C, D
        $options = @{}
        $optLetters = @('A', 'B', 'C', 'D')
        foreach ($ol in $optLetters) {
            $pat = '(?s)' + [regex]::Escape($ol) + '\.\s*([^।]*?(?=(?:[ABCD]\.|Ans:|পৃষ্ঠা:|$)))'
            $m = [regex]::Match($qBlock, $pat)
            if ($m.Success) {
                $options[$ol] = Remove-ExtraWhitespace $m.Groups[1].Value
            } else {
                # Try alternative: just text after letter
                $pat2 = '(?s)' + [regex]::Escape($ol) + '\.\s*(.*?)(?=(?:[ABCD]\.|Ans:|$))'
                $m2 = [regex]::Match($qBlock, $pat2)
                if ($m2.Success) {
                    $options[$ol] = Remove-ExtraWhitespace $m2.Groups[1].Value
                }
            }
        }
        
        # Extract answer
        $answer = ""
        $ansMatch = [regex]::Match($qBlock, 'Ans:\s*([ABCD])')
        if ($ansMatch.Success) {
            $answer = $ansMatch.Groups[1].Value
        }
        
        # Extract explanation
        $explanation = ""
        $expMatch = [regex]::Match($qBlock, '(?:ব্যাখ্যা|Explanation):\s*(.*?)(?=(?:\d+\.|পৃষ্ঠা:|$))')
        if ($expMatch.Success) {
            $explanation = Remove-ExtraWhitespace $expMatch.Groups[1].Value
        }
        
        if ($questionText -ne "") {
            $questions += @{
                id = $qNum
                question = $questionText
                options = $options
                answer = $answer
                explanation = $explanation
            }
        }
    }
    
    return $questions
}

# ---------------------------------------------------------------
# Step 3: Process all sections
# ---------------------------------------------------------------

$allQuestions = @()
$examIndex = @()

foreach ($section in $examSections) {
    $header = $section.Header
    $text = $section.Text
    
    # Determine exam name from header
    # Try to extract exam name
    $examName = ""
    $examDate = ""
    
    # Pattern: সময়: XX মিনিট [Exam Name] পদের নাম: ...
    $nameMatch = [regex]::Match($header, '(?:মিনিট|Minutes)\s+(.+?)(?:\s+পদের নাম|\s+পূর্ণমান|\s+পরীক্ষার তারিখ)')
    if ($nameMatch.Success) {
        $examName = Remove-ExtraWhitespace $nameMatch.Groups[1].Value
    }
    
    # Try to extract date
    $dateMatch = [regex]::Match($header, 'তারিখ:\s*([\d.]+)')
    if ($dateMatch.Success) {
        $examDate = $dateMatch.Groups[1].Value
    }
    
    if ([string]::IsNullOrEmpty($examName)) {
        # Try English pattern
        $nameMatch2 = [regex]::Match($header, '(?:Based\s+)?Post\s+Name:\s*(.+?)(?:\s+Written\s+Exam|\s+Facebook|\s+পরীক্ষার|\s*$)')
        if ($nameMatch2.Success) {
            $examName = Remove-ExtraWhitespace $nameMatch2.Groups[1].Value
        }
    }
    
    if ([string]::IsNullOrEmpty($examName)) {
        $examName = "Exam Section $($section.Index)"
    }
    
    $fullExamName = "$examName ($examDate)" | Remove-ExtraWhitespace
    
    Write-Host "`nProcessing section $($section.Index): $fullExamName"
    Write-Host "  Length: $($section.Length) chars"
    
    # Try Bengali extraction first
    $bengaliQuestions = Extract-Questions-Bengali -sectionText $text -examName $fullExamName
    $englishQuestions = Extract-Questions-English -sectionText $text -examName $fullExamName
    
    $sectionQuestions = @()
    if ($bengaliQuestions.Count -gt 0) {
        Write-Host "  Using Bengali extraction: $($bengaliQuestions.Count) questions"
        $sectionQuestions = $bengaliQuestions
    } elseif ($englishQuestions.Count -gt 0) {
        Write-Host "  Using English extraction: $($englishQuestions.Count) questions"
        $sectionQuestions = $englishQuestions
    } else {
        Write-Host "  No questions extracted!"
    }
    
    if ($sectionQuestions.Count -gt 0) {
        $examIndex += @{
            examName = $fullExamName
            count = $sectionQuestions.Count
            index = $section.Index
        }
        
        # Save individual file
        $safeName = $fullExamName -replace '[^\w\s-]', '' -replace '\s+', '_'
        $safeName = $safeName.Substring(0, [Math]::Min(80, $safeName.Length))
        $outFile = Join-Path $OutputDir "agradut_$($section.Index)_$safeName.json"
        
        $sectionQuestions | ConvertTo-Json -Depth 10 | Out-File -FilePath $outFile -Encoding utf8
        Write-Host "  -> Saved to $outFile"
        
        $allQuestions += $sectionQuestions
    }
}

Write-Host "`n============================================"
Write-Host "Total questions extracted: $($allQuestions.Count)"
Write-Host "Exam sections: $($examIndex.Count)"
Write-Host "Time elapsed: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

# Save combined output
$combinedFile = Join-Path $OutputDir "agradut_combined.json"
$allQuestions | ConvertTo-Json -Depth 10 | Out-File -FilePath $combinedFile -Encoding utf8
Write-Host "Combined output saved to $combinedFile"

# Save index
$indexFile = Join-Path $OutputDir "agradut_index.json"
$examIndex | ConvertTo-Json -Depth 3 | Out-File -FilePath $indexFile -Encoding utf8
Write-Host "Index saved to $indexFile"
