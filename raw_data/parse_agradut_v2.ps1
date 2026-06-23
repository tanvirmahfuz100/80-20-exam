#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$rawFile = "C:\Users\User\OneDrive\Documents\80-20 exam\raw_data\agradut_raw.txt"
$outputDir = "C:\Users\User\OneDrive\Documents\80-20 exam\public\bank"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$utf8 = [System.Text.Encoding]::UTF8
$content = [System.IO.File]::ReadAllText($rawFile, $utf8)

Write-Host "File length: $($content.Length) chars"

# Unicode ranges
# Bengali digits: U+09E6 to U+09EF
# Bengali ka-kha-ga-gha: U+0995, U+0996, U+0997, U+0998
# Using regex with Unicode categories or escape sequences

# Find question starts - Bengali digits followed by period
$bnDigitPattern = '[\u09E6-\u09EF]+'
$bnQPattern = [regex]"(?:^|(?<=[\s(]))($bnDigitPattern)\.(?=\s)"
$bnMatches = $bnQPattern.Matches($content)

Write-Host "Found $($bnMatches.Count) Bengali-numbered question starts"

$positions = @()
foreach ($m in $bnMatches) {
    $numStr = $m.Groups[1].Value
    $qnum = 0
    foreach ($c in $numStr.ToCharArray()) {
        $digitVal = [int]$c - 0x09E6
        if ($digitVal -ge 0 -and $digitVal -le 9) {
            $qnum = $qnum * 10 + $digitVal
        }
    }
    if ($qnum -ge 1 -and $qnum -le 200) {
        $positions += [PSCustomObject]@{
            Index = $m.Index
            Number = $qnum
            NumEnd = $m.Index + $m.Length
        }
    }
}

if ($positions.Count -le 1) {
    Write-Host "Fallback: trying Latin digits..."
    $positions = @()
    $latQPattern = [regex]'(?:^|(?<=[\s(]))(\d+)\.(?=\s)'
    $latMatches = $latQPattern.Matches($content)
    foreach ($m in $latMatches) {
        $qnum = 0
        if ([int]::TryParse($m.Groups[1].Value, [ref]$qnum) -and $qnum -ge 1 -and $qnum -le 300) {
            $positions += [PSCustomObject]@{
                Index = $m.Index
                Number = $qnum
                NumEnd = $m.Index + $m.Length
            }
        }
    }
    Write-Host "Found $($positions.Count) Latin-numbered question starts"
}

Write-Host "First 20 numbers: $($positions | Select-Object -First 20 | ForEach-Object { $_.Number }) -join ', '"

# Extract blocks
$blocks = @()
for ($i = 0; $i -lt $positions.Count; $i++) {
    $start = $positions[$i].Index
    $end = if ($i + 1 -lt $positions.Count) { $positions[$i + 1].Index } else { $content.Length }
    $blockText = $content.Substring($start, $end - $start).Trim()
    $blocks += [PSCustomObject]@{
        Index = $i
        Number = $positions[$i].Number
        Offset = $start
        Text = $blockText
    }
}

Write-Host "Extracted $($blocks.Count) blocks"

# Parse each block
$parsedQuestions = @()
$savedCount = 0
$bengaliOptLetters = @('\u0995', '\u0996', '\u0997', '\u0998') # ka, kha, ga, gha
$bnOptClass = '[\u0995\u0996\u0997\u0998]'
$bnOptPattern = [regex]"($bnOptClass)\.[\s\S]*?(?=\s*(?:$bnOptClass\.|\u0989\.?|\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE|$))"

# u0989 = উ (answer marker start)
# u09AAu09C3u09B7u09CDu09A0u09BE = পৃষ্ঠা (page)
# u0995u0996u0997u0998 = কখগঘ (option letters)

$bnToLatin = @{ "\u0995" = "A"; "\u0996" = "B"; "\u0997" = "C"; "\u0998" = "D" }

$savedCount = 0
foreach ($b in $blocks) {
    $text = $b.Text
    if ($text.Length -lt 15) { continue }
    
    # Try Bengali option pattern
    $hasBnOpts = $text -match '[\u0995\u0996\u0997\u0998]\.'
    $hasLatinOpts = $text -match '(?<!\w)[A-D]\. '
    
    if ($hasBnOpts) {
        # Remove question number prefix
        $clean = $text -replace '^[\u09E6-\u09EF]+\.\s*', ''
        
        # Extract Bengali option blocks in order of appearance
        $optBlocks = @()
        $bnOptPattern2 = [regex]"([\u0995\u0996\u0997\u0998])\.\s*((?:(?![\u0995\u0996\u0997\u0998]\.|[\u0989]\.?|[\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE])[\s\S])*)"
        $bnOptMatches = $bnOptPattern2.Matches($clean)
        foreach ($optMatch in $bnOptMatches) {
            $letter = $optMatch.Groups[1].Value
            $value = $optMatch.Groups[2].Value.Trim()
            if ($value.Length -gt 0) {
                $optBlocks += [PSCustomObject]@{ Letter = $letter; Value = $value }
            }
        }
        
        if ($optBlocks.Count -ge 2) {
            $fopts = [Ordered]@{}
            $ka = $false; $kha = $false; $ga = $false; $gha = $false
            foreach ($ob in $optBlocks) {
                $latin = ""
                if ($ob.Letter -eq [char]0x0995) { $latin = "A"; $ka = $true }
                elseif ($ob.Letter -eq [char]0x0996) { $latin = "B"; $kha = $true }
                elseif ($ob.Letter -eq [char]0x0997) { $latin = "C"; $ga = $true }
                elseif ($ob.Letter -eq [char]0x0998) { $latin = "D"; $gha = $true }
                if ($latin -ne "" -and -not $fopts.Contains($latin)) {
                    $fopts[$latin] = $ob.Value
                }
            }
            # Fill missing
            if (-not $ka) { $fopts["A"] = "" }
            if (-not $kha) { $fopts["B"] = "" }
            if (-not $ga) { $fopts["C"] = "" }
            if (-not $gha) { $fopts["D"] = "" }
            
            # Extract answer: উ. letter or উletter
            $ans = ""
            $ansMatch = [regex]::Match($clean, "[\u0989]\.?\s*([\u0995\u0996\u0997\u0998])")
            if ($ansMatch.Success) {
                $al = $ansMatch.Groups[1].Value
                if ($al -eq [char]0x0995) { $ans = "A" }
                elseif ($al -eq [char]0x0996) { $ans = "B" }
                elseif ($al -eq [char]0x0997) { $ans = "C" }
                elseif ($al -eq [char]0x0998) { $ans = "D" }
            }
            
            # Clean question
            $qclean = $clean -replace "[\u0995\u0996\u0997\u0998]\.[\s\S]*?$", ''
            $qclean = $qclean -replace "[\u0989]\.?\s*[\u0995\u0996\u0997\u0998]\s*", ''
            $qclean = $qclean -replace "[\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE].*$", ''
            $qclean = $qclean -replace 'G\s*$', ''
            $qclean = $qclean -replace '^\d+\s*', ''
            $qclean = $qclean.Trim()
            
            if ($qclean.Length -gt 5 -and $ans -ne "") {
                $parsedQuestions += [PSCustomObject]@{
                    id = $savedCount
                    question = $qclean
                    options = $fopts
                    answer = $ans
                    source = "Agradut Job"
                    subject = "Bangla"
                    explanation = ""
                }
                $savedCount++
            }
        }
    } elseif ($hasLatinOpts) {
        # Latin options
        $clean = $text -replace '^\d+\.\s*', ''
        
        $optBlocks = @()
        $latOptPattern = [regex]"(?<!\w)([A-D])\.\s+((?:(?!\s*[A-D]\.)[\s\S])*?)(?=\s*(?:[A-D]\.|$|[\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE]))"
        $latOptMatches = $latOptPattern.Matches($clean)
        foreach ($optMatch in $latOptMatches) {
            $letter = $optMatch.Groups[1].Value
            $value = $optMatch.Groups[2].Value.Trim()
            if ($value.Length -gt 0) {
                $optBlocks += [PSCustomObject]@{ Letter = $letter; Value = $value }
            }
        }
        
        if ($optBlocks.Count -ge 2) {
            $fopts = [Ordered]@{}
            foreach ($l in @('A','B','C','D')) { $fopts[$l] = "" }
            foreach ($ob in $optBlocks) {
                if ($fopts.Contains($ob.Letter)) {
                    $fopts[$ob.Letter] = $ob.Value
                }
            }
            
            # Extract answer
            $ans = ""
            # Match various answer patterns
            $ansMatch = [regex]::Match($clean, "[\u0985\u0986\u0987\u0988\u0989]\s*\.?\s*([A-D])(?:\s|$)")
            if (-not $ansMatch.Success) {
                $ansMatch = [regex]::Match($clean, "([A-D])\s*[\u0985\u0986\u0987\u0988\u0989]")
            }
            if (-not $ansMatch.Success) {
                $ansMatch = [regex]::Match($clean, '\?\s*\.?\s*([A-D])(?:\s|$)')
            }
            if ($ansMatch.Success) { $ans = $ansMatch.Groups[1].Value }
            
            # Clean question
            $qclean = $clean -replace "(?<!\w)[A-D]\.\s+((?:(?!\s*[A-D]\.)[\s\S])*?)(?=\s*(?:[A-D]\.|$|[\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE]))", ''
            $qclean = $qclean -replace "[\u0985-\u0989]\s*\.?\s*[A-D]", ''
            $qclean = $qclean -replace "[\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE].*$", ''
            $qclean = $qclean -replace '^\d+\.\s*', ''
            $qclean = $qclean.Trim()
            
            if ($qclean.Length -gt 5 -and $ans -ne "") {
                # Detect subject
                $subj = "General"
                if ($clean -match 'Competitive English|Idiom|Active|Passive|Spelling|Synonym|Antonym|One word|Narration|Speech|Phrase|Verb|Adverb|Noun|Pronoun|Adjective|Preposition|Conjunction|Interjection|Grammar|Tense|Voice') { $subj = "English" }
                elseif ($clean -match 'Basic Math|গণিত|ratio|percentage|average|probability|profit|loss|interest|speed|distance|time|work|area|volume|permutation|combination|number|digit|fraction|decimal|square|root|triangle|circle') { $subj = "Math" }
                elseif ($clean -match 'সাধারণ জ্ঞান|Bangladesh|UN|world|Nobel|country|president|prime minister|capital|river|mountain|ocean|continent|organization|treaty|agreement|sports|game|cricket|football|Olympic|Asian') { $subj = "GK" }
                elseif ($clean -match 'কম্পিউটার|computer|binary|RAM|software|hardware|programming|language|database|network|internet|email|website|server|client|CPU|memory|disk|drive|file|folder|operating|system|Windows|Linux|Mac|Microsoft|Oracle|Java|Python|C\+\+|HTML|CSS') { $subj = "Computer" }
                elseif ($clean -match 'বিজ্ঞান|science|physics|chemistry|biology|cell|atom|molecule|force|energy|light|sound|heat|electricity|magnet|planet|star|satellite|gravity|acid|base|salt|metal|non-metal') { $subj = "Science" }
                
                $parsedQuestions += [PSCustomObject]@{
                    id = $savedCount
                    question = $qclean
                    options = $fopts
                    answer = $ans
                    source = "Agradut Job"
                    subject = $subj
                    explanation = ""
                }
                $savedCount++
            }
        }
    }
}

Write-Host "Parsed $savedCount questions total"

if ($parsedQuestions.Count -gt 0) {
    $jsonPath = Join-Path $outputDir "agradut_parsed.json"
    $parsedQuestions | ConvertTo-Json -Depth 3 | Set-Content -Path $jsonPath -Encoding UTF8
    Write-Host "Saved to $jsonPath"
    
    # Also save by subject
    $subjects = $parsedQuestions | Group-Object subject
    foreach ($sg in $subjects) {
        $safeName = "agradut_" + $sg.Name.ToLower().Replace(' ', '_')
        $sgPath = Join-Path $outputDir "$safeName.json"
        $sg.Group | ConvertTo-Json -Depth 3 | Set-Content -Path $sgPath -Encoding UTF8
        Write-Host "  $($sg.Name): $($sg.Count) questions -> $safeName.json"
    }
}
