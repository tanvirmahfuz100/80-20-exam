#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$rawFile = "C:\Users\User\OneDrive\Documents\80-20 exam\raw_data\agradut_raw.txt"
$outputDir = "C:\Users\User\OneDrive\Documents\80-20 exam\public\bank"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$utf8 = [System.Text.Encoding]::UTF8

$content = [System.IO.File]::ReadAllText($rawFile, $utf8)

# Bengali numerals 0-9
$bnDigits = @{'0'=0;'1'=1;'2'=2;'3'=3;'4'=4;'5'=5;'6'=6;'7'=7;'8'=8;'9'=9}
$bnNumPattern = [regex]'[0-9]'

function Parse-BengaliNumber($s) {
    $r = 0
    foreach ($c in $s.ToCharArray()) {
        if ($bnDigits.ContainsKey($c)) { $r = $r * 10 + $bnDigits[$c] }
        else { return -1 }
    }
    return $r
}

# Bengali option letters in order: ka, kha, ga, gha
$bnOptKey = @("A","B","C","D")

Write-Host "File length: $($content.Length) chars"

# Find exam sections
$examHeaders = [regex]::Matches($content, '(?<=^|(?<=[\s\S]))((?:?????????|???|???)\s*Recent\s*Job\s*Solution[\s\S]*?)(?=(?:?????????|???|???)\s*Recent\s*Job\s*Solution|Confirm\s*Job\s*Solution|Job\s*Solution\s|$)', 'IgnoreCase')
if ($examHeaders.Count -eq 0) {
    # Fallback: treat whole file as one exam
    $examHeaders = [regex]::Matches($content, '^[\s\S]*')
}
Write-Host "Found $($examHeaders.Count) exam sections"

$eid = 0
$allQuestions = @()
foreach ($em in $examHeaders) {
    $eid++
    $et = $em.Groups[1].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($et)) { continue }
    
    # Extract header
    $hdr = ""
    $qStart = $et.IndexOf(".")
    if ($qStart -gt 0 -and $qStart -lt 300) { $hdr = $et.Substring(0, $qStart).Trim() }
    else { $hdr = $et.Substring(0, [Math]::Min(200, $et.Length)).Trim() }
    
    # Get exam date from header
    $dateStr = ""
    if ($hdr -match '(\d{2}\.\d{2}\.\d{4})') { $dateStr = $matches[1] }
    
    # Find all Bengali question number positions
    $positions = [regex]::Matches($et, '(?:^|(?<=[\s(]))([''$bnNumPattern $bnNumPattern']+)\.(?:\s|(?!\d))')
    
    if ($positions.Count -le 1) {
        # Try Latin numbers
        $positions = [regex]::Matches($et, '(?:^|(?<=[\s(]))(\d+)\.(?:\s|(?!\d))')
    }
    
    Write-Host "Exam $eid`: $($positions.Count) question starts found"
    if ($dateStr) { Write-Host "  Date: $dateStr" }
    
    # Extract blocks between question numbers
    $blocks = @()
    for ($i = 0; $i -lt $positions.Count; $i++) {
        $start = $positions[$i].Index
        $end = if ($i + 1 -lt $positions.Count) { $positions[$i + 1].Index } else { $et.Length }
        $block = $et.Substring($start, $end - $start).Trim()
        $qNumStr = $positions[$i].Groups[1].Value
        
        $qNum = Parse-BengaliNumber $qNumStr
        if ($qNum -lt 0) {
            try { $qNum = [int]::Parse($qNumStr) } catch { continue }
        }
        if ($qNum -lt 1 -or $qNum -gt 500) { continue }
        
        $blocks += [PSCustomObject]@{ Index = $i; Number = $qNum; Text = $block }
    }
    
    # Sort by position index (keep original order)
    $sorted = $blocks | Sort-Object Index
    
    # Parse each block
    $saved = @()
    foreach ($b in $sorted) {
        $questionText = $b.Text
        if ([string]::IsNullOrWhiteSpace($questionText)) { continue }
        
        # Check if it has Bengali options (ka/kha/ga/gha)
        $hasBn = $questionText -match '[ক-ঘ]\.'
        # Check for Latin options (A., B., etc.)
        $hasLatin = $questionText -match '(?<!\w)[A-D]\. '
        # Check for question with no options (discard)
        $hasQText = $questionText.Length -gt 10
        
        if (-not $hasQText) { continue }
        
        if ($hasBn) {
            # --- Bengali options (ka/kha/ga/gha) ---
            $clean = $questionText -replace '^[০-৯]+\.\s*', ''
            
            # Extract option blocks in order of appearance
            $optPattern = [regex]'([ক-ঘ])\.\s*((?:(?!\s*[ক-ঘ]\.)[\s\S])*?)(?=\s*(?:[ক-ঘ]\.|উ\.|উ\s|পৃষ্ঠা|$))'
            $optMatches = $optPattern.Matches($clean)
            
            $rawOpts = @{}
            $optOrder = @()
            foreach ($om in $optMatches) {
                $letter = $om.Groups[1].Value
                $value = $om.Groups[2].Value.Trim()
                if (-not $rawOpts.ContainsKey($letter)) {
                    $rawOpts[$letter] = $value
                    $optOrder += $letter
                }
            }
            
            if ($rawOpts.Count -ge 2) {
                # Build ordered options: A=ka, B=kha, C=ga, D=gha
                $fopts = [Ordered]@{}
                # Map Bengali letter to Latin based on the bnOptKey order
                $bnLatinMap = @{'ক'='A'; 'খ'='B'; 'গ'='C'; 'ঘ'='D'}
                foreach ($bl in @('ক','খ','গ','ঘ')) {
                    if ($rawOpts.ContainsKey($bl)) {
                        $fopts[$bnLatinMap[$bl]] = $rawOpts[$bl]
                    } else {
                        $fopts[$bnLatinMap[$bl]] = ""
                    }
                }
                
                # Extract answer
                $ans = ""
                if ($clean -match 'উ\.\s*([ক-ঘ])') { $ans = $bnLatinMap[$matches[1]] }
                elseif ($clean -match 'উ([ক-ঘ])') { $ans = $bnLatinMap[$matches[1]] }
                
                # Clean question: remove options and answer markers
                $qclean = $clean -replace '[ক-ঘ]\.\s*(?:(?!(?:[ক-ঘ]\.|উ\.|উ\s|পৃষ্ঠা))[\s\S])*', ''
                $qclean = $qclean -replace 'উ\.\s*[ক-ঘ]\s*', ''
                $qclean = $qclean -replace 'উ[ক-ঘ]\s*', ''
                $qclean = $qclean -replace 'পৃষ্ঠা.*$', ''
                $qclean = $qclean -replace 'G\s*$', ''
                $qclean = $qclean -replace '^\s*\d+\.\s*', ''
                $qclean = $qclean.Trim()
                # Remove trailing Bengali digit leftovers
                $qclean = $qclean -replace '\s+[০-৯]+$', ''
                
                if ($qclean.Length -gt 3 -and $ans -ne "") {
                    $sub = "General"
                    if ($clean -match '??????? ?????') { $sub = "Bangla" }
                    elseif ($clean -match 'Competitive English') { $sub = "English" }
                    elseif ($clean -match 'Basic Math') { $sub = "Math" }
                    
                    $saved += [PSCustomObject]@{
                        id = 0
                        question = $qclean
                        options = $fopts
                        answer = $ans
                        source = if ($dateStr) { "Agradut Job ($dateStr)" } else { "Agradut Job" }
                        subject = $sub
                        explanation = ""
                    }
                }
            }
        } elseif ($hasLatin) {
            # --- Latin options (A., B., C., D.) ---
            $clean = $questionText -replace '^\d+\.\s*', ''
            
            $optPattern = [regex]'(?<!\w)([A-D])\.\s+([^A-D]*?)(?=\s*(?:[A-D]\.|$|পৃষ্ঠা))'
            $optMatches = $optPattern.Matches($clean)
            
            $rawOpts = @{}
            foreach ($om in $optMatches) {
                $letter = $om.Groups[1].Value
                $value = $om.Groups[2].Value.Trim()
                if (-not $rawOpts.ContainsKey($letter)) {
                    $rawOpts[$letter] = $value
                }
            }
            
            if ($rawOpts.Count -ge 2) {
                $fopts = [Ordered]@{}
                foreach ($l in @('A','B','C','D')) {
                    $fopts[$l] = if ($rawOpts.ContainsKey($l)) { $rawOpts[$l] } else { "" }
                }
                
                # Extract answer
                $ans = ""
                if ($clean -match '।\s*\.?\s*([A-D])(?:\s|$)') { $ans = $matches[1] }
                elseif ($clean -match '\?\s*\.?\s*([A-D])(?:\s|$)') { $ans = $matches[1] }
                elseif ($clean -match '([A-D])\s*।') { $ans = $matches[1] }
                
                # Clean question
                $qclean = $clean -replace '(?<!\w)[A-D]\.\s+[^A-D]*?(?=\s*(?:[A-D]\.|$))', ''
                $qclean = $qclean -replace '।\s*\.?\s*[A-D]', ''
                $qclean = $qclean -replace 'পৃষ্ঠা.*$', ''
                $qclean = $qclean -replace '^\d+\.\s*', ''
                $qclean = $qclean.Trim()
                
                if ($qclean.Length -gt 3 -and $ans -ne "") {
                    $sub = "General"
                    if ($clean -match 'Competitive English|Idiom|Active|Passive|Spelling|Synonym|Antonym') { $sub = "English" }
                    elseif ($clean -match 'Basic Math|গণিত|ratio|percentage|average|probability') { $sub = "Math" }
                    elseif ($clean -match 'সাধারণ জ্ঞান|GK|Bangladesh|UN|world|Nobel') { $sub = "GK" }
                    elseif ($clean -match 'কম্পিউটার|computer|binary|RAM|software|hardware') { $sub = "Computer" }
                    elseif ($clean -match 'বিজ্ঞান|science') { $sub = "Science" }
                    
                    $saved += [PSCustomObject]@{
                        id = 0
                        question = $qclean
                        options = $fopts
                        answer = $ans
                        source = if ($dateStr) { "Agradut Job ($dateStr)" } else { "Agradut Job" }
                        subject = $sub
                        explanation = ""
                    }
                }
            }
        }
    }
    
    Write-Host "  Parsed $($saved.Count) questions"
    
    if ($saved.Count -gt 0) {
        $fname = "agradut_exam_$eid"
        if ($dateStr) { $fname = "agradut_$dateStr" }
        $jpath = Join-Path $outputDir "$fname.json"
        $saved | ConvertTo-Json -Depth 3 | Set-Content -Path $jpath -Encoding UTF8
        Write-Host "  Saved: $fname.json"
        $allQuestions += $saved
    }
}

Write-Host "`nTotal parsed: $($allQuestions.Count) questions across $eid exams"
