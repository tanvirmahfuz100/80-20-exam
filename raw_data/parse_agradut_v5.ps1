# parse_agradut_v5.ps1 - Anchor on question numbers, extract clean questions

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

# Build exam sections with metadata
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
    
    $examSections += @{
        Index=$i; Text=$sectionText
        ExamName=if($examName){"$examName ($examDate)"}else{"Section $i"}
    }
    $dn = if ($examName.Length -gt 50) { $examName.Substring(0,50)+"..." } else { $examName }
    Write-Host "  [$i] $dn len=$($sectionText.Length)"
}

# ---------------------------------------------------------------
# Parse questions in each section
# ---------------------------------------------------------------
$b2e = @{'ক'='A';'খ'='B';'গ'='C';'ঘ'='D'}
$bnDigits = @{'০'='0';'১'='1';'২'='2';'৩'='3';'৪'='4';'৫'='5';'৬'='6';'৭'='7';'৮'='8';'৯'='9'}
$allQuestions = @()
$examIndex = @()

foreach ($section in $examSections) {
    $text = $section.Text
    $examName = $section.ExamName
    Write-Host "`n=== [$($section.Index)] $examName ==="
    
    # Find all question number positions (both Bengali and Arabic)
    $qPositions = @()
    
    # Bengali numbers
    foreach ($m in [regex]::Matches($text, '(?<=^|\s|[\u0980-\u09FF])([০১২৩৪৫৬৭৮৯]+)\s*\.\s*(?=\S)')) {
        $qPositions += @{ pos = $m.Index; num = $m.Groups[1].Value; len = $m.Length; }
    }
    # Arabic numbers (only if not inside another number or already matched)
    foreach ($m in [regex]::Matches($text, '(?<=^|\s|[^\d])(\d+)\s*\.\s*(?=\S)')) {
        $num = $m.Groups[1].Value
        if ($num -ge 1 -and $num -le 200) {  # Only actual question numbers
            $qPositions += @{ pos = $m.Index; num = $num; len = $m.Length; }
        }
    }
    
    # Sort and deduplicate by position
    $qPositions = $qPositions | Sort-Object pos | Get-Unique -AsString
    
    Write-Host "  Found $($qPositions.Count) question numbers"
    if ($qPositions.Count -eq 0) { continue }
    
    $questions = @()
    
    for ($qi = 0; $qi -lt $qPositions.Count; $qi++) {
        $q = $qPositions[$qi]
        $qNum = $q.num
        
        # Convert Bengali digits to Arabic if needed
        $qNumInt = 0
        $qNumStr = ""
        foreach ($ch in $qNum.ToCharArray()) {
            if ($bnDigits.ContainsKey($ch)) { $qNumStr += $bnDigits[$ch] }
            else { $qNumStr += $ch }
        }
        [int]::TryParse($qNumStr, [ref]$qNumInt) | Out-Null
        
        # Block: from this question number to next question number
        $blockStart = $q.pos
        $blockEnd = if ($qi -lt $qPositions.Count-1) { $qPositions[$qi+1].pos } else { $text.Length }
        $block = $text.Substring($blockStart, $blockEnd - $blockStart)
        
        # Remove the question number prefix from block for parsing
        $afterQNum = $q.pos + $q.len
        $contentAfterQ = $text.Substring($afterQNum, $blockEnd - $afterQNum)
        
        # Extract question text (up to first option marker)
        $qText = ""
        $optMarkers = @('ক.', 'খ.', 'গ.', 'ঘ.', 'A.', 'B.', 'C.', 'D.', 'উ.', 'Ans:', 'পৃষ্ঠা:')
        $firstOptPos = $contentAfterQ.Length
        foreach ($om in $optMarkers) {
            $oi = $contentAfterQ.IndexOf($om)
            if ($oi -ge 0 -and $oi -lt $firstOptPos) { $firstOptPos = $oi }
        }
        $qText = Trim $contentAfterQ.Substring(0, $firstOptPos)
        
        # Skip if no meaningful question text
        if (-not $qText -or $qText.Length -lt 3) { continue }
        
        # Extract answer (work backwards from end of block)
        $answer = ""
        $ansBlock = $block
        
        # Check for উ. answer pattern
        $ansM = [regex]::Match($ansBlock, 'উ\.?\s*([কখগঘ])')
        if ($ansM.Success) {
            $answer = $b2e[$ansM.Groups[1].Value]
        }
        # Check for Ans: pattern
        if (-not $answer) {
            $ansM2 = [regex]::Match($ansBlock, 'Ans:\s*([ABCD])')
            if ($ansM2.Success) {
                $answer = $ansM2.Groups[1].Value
            }
        }
        
        if (-not $answer) { continue }
        
        # Extract options (best effort from the contentAfterQ)
        $opts = [Ordered]@{}
        
        # Try Bengali option markers first
        $bOpts = @('A','B','C','D')
        $bOptMarkers = @('ক','খ','গ','ঘ')
        $bPositions = @()
        foreach ($om in $bOptMarkers) {
            $oi = $contentAfterQ.IndexOf("$om.")
            if ($oi -ge 0) {
                $bPositions += @{ marker=$om; key=$b2e[$om]; pos=$oi }
            }
        }
        # Also try English option markers
        $ePositions = @()
        foreach ($om in @('A','B','C','D')) {
            $oi = $contentAfterQ.IndexOf("$om.")
            if ($oi -ge 0) {
                $ePositions += @{ marker=$om; key=$om; pos=$oi }
            }
        }
        
        # Use the option set that has more matches
        $allOptPositions = @()
        if ($bPositions.Count -ge $ePositions.Count) {
            $allOptPositions = $bPositions | Sort-Object pos
            # Map to position order: 1st=A, 2nd=B, 3rd=C, 4th=D
            $orderedKeys = @('A','B','C','D')
            for ($oi2 = 0; $oi2 -lt [Math]::Min(4, $allOptPositions.Count); $oi2++) {
                $marker = $allOptPositions[$oi2].marker
                $startAfter = $allOptPositions[$oi2].pos + "$marker.".Length
                $endPos = $contentAfterQ.Length
                
                # Find next option or answer
                foreach ($nextMarker in $bOptMarkers + @('উ', 'Ans:', 'পৃষ্ঠা:')) {
                    $ni = $contentAfterQ.IndexOf("$nextMarker.", $startAfter)
                    if ($ni -ge 0 -and $ni -lt $endPos -and $nextMarker -ne $marker) { 
                        # Check if this nextMarker is the same as current with different prefix
                        if ($b2e.ContainsKey($nextMarker) -and $b2e[$nextMarker] -ne $orderedKeys[$oi2]) {
                            $endPos = $ni
                        } elseif (-not $b2e.ContainsKey($nextMarker)) {
                            $endPos = $ni
                        }
                    }
                }
                # Also try without dot for উ
                $ni2 = $contentAfterQ.IndexOf('উ', $startAfter)
                if ($ni2 -ge 0 -and $ni2 -lt $endPos) { $endPos = $ni2 }
                
                if ($startAfter -lt $endPos) {
                    $optVal = Trim ($contentAfterQ.Substring($startAfter, $endPos - $startAfter))
                    # Clean up
                    $optVal = Trim ($optVal -replace 'পূর্ণমান:\s*\d+', '')
                    # Remove trailing answer markers
                    $optVal = Trim ($optVal -replace 'উ\.?\s*[কখগঘ]', '')
                    if ($optVal) { $opts[$orderedKeys[$oi2]] = $optVal }
                }
            }
        } else {
            # English options
            $allOptPositions = $ePositions | Sort-Object pos
            for ($oi2 = 0; $oi2 -lt [Math]::Min(4, $allOptPositions.Count); $oi2++) {
                $marker = $allOptPositions[$oi2].marker
                $startAfter = $allOptPositions[$oi2].pos + "$marker.".Length
                $endPos = $contentAfterQ.Length
                foreach ($nextMarker in @('B','C','D') + @('Ans:', 'পৃষ্ঠা:')) {
                    if ($nextMarker -le $marker) { continue }
                    $ni = $contentAfterQ.IndexOf("$nextMarker.", $startAfter)
                    if ($ni -ge 0 -and $ni -lt $endPos) { $endPos = $ni }
                }
                if ($startAfter -lt $endPos) {
                    $optVal = Trim ($contentAfterQ.Substring($startAfter, $endPos - $startAfter))
                    $optVal = Trim ($optVal -replace 'পূর্ণমান:\s*\d+', '')
                    if ($optVal) { $opts[$marker] = $optVal }
                }
            }
        }
        
        # Extract explanation (look for ব্যাখ্যা: or Explanation: in the block)
        $explanation = ""
        $expM = [regex]::Match($block, '(?:ব্যাখ্যা|Explanation):\s*(.+?)(?=\d+\s*\.\s*[A-Z০১২৩৪৫৬৭৮৯]|পৃষ্ঠা:\s*\d|$)')
        if ($expM.Success) {
            $explanation = Trim $expM.Groups[1].Value
        } elseif ($block -match 'Ans:\s*[ABCD]\s+(.+?)(?=\d+\s*\.\s*[A-Z০১২৩৪৫৬৭৮৯]|পৃষ্ঠা:\s*\d|$)') {
            # Fallback: text after Ans: until next question
            $explanation = Trim $matches[1]
            # Remove ব্যাখ্যা: prefix if present
            if ($explanation -match '^(?:ব্যাখ্যা|Explanation):\s*(.*)') {
                $explanation = Trim $matches[1]
            }
        }
        
        $questions += @{
            id = $qNumInt
            question = $qText
            options = $opts
            answer = $answer
            source = $examName
            explanation = $explanation
        }
    }
    
    Write-Host "  Extracted $($questions.Count) questions"
    
    if ($questions.Count -gt 0) {
        $examIndex += @{ examName=$examName; count=$questions.Count }
        $sn = $examName -replace '[^\w\s-]','' -replace '\s+','_'
        $safeName = if ($sn.Length -gt 80) { $sn.Substring(0,80) } else { $sn }
        $outFile = Join-Path $OutputDir "agradut_$($section.Index)_$safeName.json"
        $questions | ConvertTo-Json -Depth 10 | Out-File $outFile -Encoding utf8
        Write-Host "  -> $outFile"
        $allQuestions += $questions
    }
}

Write-Host "`n=== Done: $($allQuestions.Count) total questions ==="
Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

$allQuestions | ConvertTo-Json -Depth 10 | Out-File (Join-Path $OutputDir "agradut_v5_combined.json") -Encoding utf8
$examIndex | ConvertTo-Json -Depth 3 | Out-File (Join-Path $OutputDir "agradut_v5_index.json") -Encoding utf8
