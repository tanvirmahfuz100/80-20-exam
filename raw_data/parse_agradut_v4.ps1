# parse_agradut_v4.ps1 - Simplified MCQ extraction
# Strategy: anchor on answer markers, extract context around them

param(
    [string]$InputFile = "raw_data/agradut_raw.txt",
    [string]$OutputDir = "public/bank"
)

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$content = [System.IO.File]::ReadAllText((Resolve-Path $InputFile), [System.Text.Encoding]::UTF8)
Write-Host "Read $($content.Length) chars"

function Trim { param([string]$s) ($s -replace '\s+', ' ').Trim() }

# ---------------------------------------------------------------
# Find exam boundaries
# ---------------------------------------------------------------
$examStarts = @()
foreach ($m in [regex]::Matches($content, 'অগ্রদূত\s+Recent\s+Job\s+Solution')) {
    $pos = $m.Index + $m.Length
    $len = [Math]::Min(200, $content.Length - $pos)
    $la = $content.Substring($pos, $len)
    if ($la -match 'সময়\s*:' -or $la -match 'পদের\s+নাম\s*:') { $examStarts += $m.Index }
}

$sorted = $examStarts | Sort-Object; $cleanStarts = @(); $last = -1000
foreach ($s in $sorted) { if ($s - $last -gt 200) { $cleanStarts += $s; $last = $s } }

Write-Host "Found $($cleanStarts.Count) exam sections"

# Build exam sections
$examSections = @()
for ($i = 0; $i -lt $cleanStarts.Count; $i++) {
    $start = $cleanStarts[$i]; $end = if ($i -lt $cleanStarts.Count-1) { $cleanStarts[$i+1] } else { $content.Length }
    $sectionText = $content.Substring($start, $end - $start)
    $hlen = [Math]::Min(400, $sectionText.Length)
    $h = Trim ($sectionText.Substring(0, $hlen) -replace "`r|`n"," ")
    
    $examName = ""; $examDate = ""
    $m1 = [regex]::Match($h, '(?:মিনিট|Minutes)\s+(.+?)(?:\s+পদের নাম|\s+পূর্ণমান|\s+পরীক্ষার|\s*$)')
    if ($m1.Success -and $m1.Groups[1].Value.Trim().Length -gt 3) { $examName = Trim $m1.Groups[1].Value }
    if (-not $examName) {
        $m2 = [regex]::Match($h, '(সমন্বিত\s+[\d০১২৩৪৫৬৭৮৯]+\s+ব্যাংক[^প]*?)(?:\s+পদের|\s*$)')
        if ($m2.Success) { $examName = Trim $m2.Groups[1].Value }
    }
    if ($h -match 'তারিখ:\s*([\d./]+)') { $examDate = $matches[1] }
    
    $bCount = [regex]::Matches($sectionText, 'উ\.?\s*[কখগঘ]').Count
    $eCount = [regex]::Matches($sectionText, 'Ans:\s*[ABCD]').Count
    $format = if ($eCount -gt $bCount) { "english" } else { "bengali" }
    
    $examSections += @{
        Index=$i; Start=$start; End=$end; Length=$end-$start
        ExamName=if($examName){"$examName ($examDate)"}else{"Section $i"}
        Format=$format; Text=$sectionText
        BengAnswers=$bCount; EngAnswers=$eCount
    }
    
    $dn = if ($examName.Length -gt 60) { $examName.Substring(0,60)+"..." } else { $examName }
    Write-Host "  [$i] $dn fmt=$format b=$bCount e=$eCount len=$($sectionText.Length)"
}

# ---------------------------------------------------------------
# Parse questions
# ---------------------------------------------------------------
$b2e = @{'ক'='A';'খ'='B';'গ'='C';'ঘ'='D'}
$allQuestions = @()
$examIndex = @()

foreach ($section in $examSections) {
    $text = $section.Text; $examName = $section.ExamName; $format = $section.Format
    Write-Host "`n=== [$($section.Index)] $examName ==="
    
    # Collect all answer positions
    $ansPositions = @()
    if ($format -eq "english") {
        foreach ($m in [regex]::Matches($text, 'Ans:\s*([ABCD])')) {
            $ansPositions += @{ pos = $m.Index; letter = $m.Groups[1].Value; len = $m.Length; type = "eng" }
        }
    }
    # Always check Bengali answers
    foreach ($m in [regex]::Matches($text, 'উ\.?\s*([কখগঘ])')) {
        $ansPositions += @{ pos = $m.Index; letter = $b2e[$m.Groups[1].Value]; len = $m.Length; type = "bng" }
    }
    # Also catch English answers even in Bengali sections
    if ($format -ne "english") {
        foreach ($m in [regex]::Matches($text, 'Ans:\s*([ABCD])')) {
            $ansPositions += @{ pos = $m.Index; letter = $m.Groups[1].Value; len = $m.Length; type = "eng" }
        }
    }
    $ansPositions = $ansPositions | Sort-Object pos
    
    Write-Host "  Found $($ansPositions.Count) answer markers"
    
    $questions = @()
    
    # Bengali/Arabic number pattern for questions
    $bNumPat = '[০১২৩৪৫৬৭৮৯]+'
    $aNumPat = '\d+'
    
    foreach ($i in 0..($ansPositions.Count-1)) {
        $ans = $ansPositions[$i]
        
        # Block: from end of previous answer (or text start) to just after current answer
        $prevEnd = if ($i -gt 0) { $ansPositions[$i-1].pos + $ansPositions[$i-1].len } else { 0 }
        $blockEnd = $ans.pos + $ans.len
        $blockStart = $prevEnd
        
        if ($blockStart -ge $blockEnd -or $blockStart -ge $text.Length) { continue }
        $blockLen = [Math]::Min($blockEnd - $blockStart, $text.Length - $blockStart)
        if ($blockLen -le 0) { continue }
        $block = $text.Substring($blockStart, $blockLen)
        
        # Find question number at or near the end of the block
        $qNum = ""; $qText = ""
        
        # Try to find a Bengali or Arabic number before a period near the end of the block
        $numMr = [regex]::Match($block, "(?:$bNumPat|$aNumPat)\s*\.")
        if ($numMr.Success) {
            $qNum = $numMr.Value -replace '\.', '' -replace '\s', ''
            $numStr = $numMr.Value
            $numIdx = $block.LastIndexOf($numStr)
            if ($numIdx -ge 0) {
                $afterNum = $numIdx + $numStr.Length
                $rawQ = $block.Substring($afterNum)
                # Strip options/punctuation/refs
                $qText = Trim ($rawQ -replace '(?:ক\.|খ\.|গ\.|ঘ\.|A\.|B\.|C\.|D\.).*', '')
            }
        }
        
        if (-not $qNum) { continue }
        
        # Extract options (best effort)
        $opts = [Ordered]@{}
        if ($format -eq "english") {
            $optPatEng = @{A='B\.|Ans:'; B='C\.|Ans:'; C='D\.|Ans:'; D='Ans:'}
            foreach ($ol in @('A','B','C','D')) {
                $om = [regex]::Match($block, [regex]::Escape("$ol.") + '\s*(.+?)(?=' + $optPatEng[$ol] + '|$)' )
                if ($om.Success) { $v = Trim $om.Groups[1].Value; if ($v) { $opts[$ol] = $v } }
            }
        } else {
            $olMap = @{'ক'='A';'খ'='B';'গ'='C';'ঘ'='D'}
            foreach ($ol in @('ক','খ','গ','ঘ')) {
                # Simple substring-based extraction
                $olIdx = $block.IndexOf("$ol.")
                if ($olIdx -ge 0) {
                    $startAfter = $olIdx + ("$ol.").Length
                    # Find next option or answer or page ref
                    $nextPos = $block.Length
                    foreach ($other in @('ক','খ','গ','ঘ')) {
                        if ($other -ne $ol) {
                            $ni = $block.IndexOf("$other.", $startAfter)
                            if ($ni -ge 0 -and $ni -lt $nextPos) { $nextPos = $ni }
                        }
                    }
                    $ansIdx = $block.IndexOf('উ.', $startAfter)
                    if ($ansIdx -ge 0 -and $ansIdx -lt $nextPos) { $nextPos = $ansIdx }
                    $prIdx = $block.IndexOf('পৃষ্ঠা:', $startAfter)
                    if ($prIdx -ge 0 -and $prIdx -lt $nextPos) { $nextPos = $prIdx }
                    
                    $optVal = $block.Substring($startAfter, $nextPos - $startAfter)
                    $optVal = Trim ($optVal -replace 'পূর্ণমান:\s*\d+', '')
                    $optVal = Trim $optVal
                    if ($optVal) { $opts[$olMap[$ol]] = $optVal }
                }
            }
        }
        
        # Extract explanation for English format
        $explanation = ""
        if ($format -eq "english") {
            $fwdLen = [Math]::Min(3000, $text.Length - $ans.pos)
            $fwd = $text.Substring($ans.pos, $fwdLen)
            # Find ব্যাখ্যা: or Explanation:
            $expM = [regex]::Match($fwd, '(?:Ans:\s*[ABCD]\s*)(.*?)(?=\d+\s*\.\s|পৃষ্ঠা:\s*\d|$)')
            if ($expM.Success) {
                $expRaw = $expM.Groups[1].Value
                if ($expRaw -match '^(?:ব্যাখ্যা|Explanation):\s*(.*)') { $explanation = Trim $matches[1] }
                elseif ($expRaw.Length -gt 20) { $explanation = Trim $expRaw }
            }
        }
        
        $questions += @{
            id = $qNum
            question = $qText
            options = $opts
            answer = $ans.letter
            source = $examName
            explanation = $explanation
        }
    }
    
    Write-Host "  Extracted $($questions.Count) questions"
    
    if ($questions.Count -gt 0) {
        $examIndex += @{ examName=$examName; count=$questions.Count; format=$format }
        $sn = $examName -replace '[^\w\s-]','' -replace '\s+','_'
        $safeName = if ($sn.Length -gt 80) { $sn.Substring(0, 80) } else { $sn }
        $outFile = Join-Path $OutputDir "agradut_$($section.Index)_$safeName.json"
        $questions | ConvertTo-Json -Depth 10 | Out-File $outFile -Encoding utf8
        Write-Host "  -> $outFile"
        $allQuestions += $questions
    }
}

Write-Host "`n=== Done: $($allQuestions.Count) total questions ==="
Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

$allQuestions | ConvertTo-Json -Depth 10 | Out-File (Join-Path $OutputDir "agradut_combined.json") -Encoding utf8
$examIndex | ConvertTo-Json -Depth 3 | Out-File (Join-Path $OutputDir "agradut_index.json") -Encoding utf8
