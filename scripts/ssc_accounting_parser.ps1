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
    $greenBG = 'bg-\[#017A471A\]|bg-\[\#017A47\]'
    $yellowBG = 'bg-\[#F59E0B1F\]|bg-\[\#F59E0B\]'
    
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
    $greenFound = $false
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
            if ($btnContent -match $greenBG) {
                $ansLetter = $en
                $greenFound = $true
            }
        }
    }
    
    # If no green marker found, try yellow as fallback (chorcha sometimes uses yellow for correct)
    if (-not $greenFound -and $ansLetter -eq "") {
        $btnIdx = 0
        foreach ($bStart in $btnStarts) {
            if ($btnIdx -ge 4) { break }
            $en = $enLetters[$btnIdx]
            $btnIdx++
            
            $bEnd = $Block.IndexOf('</button>', $bStart)
            if ($bEnd -lt 0) { continue }
            $btnContent = $Block.Substring($bStart, $bEnd - $bStart + 9)
            if ($btnContent.Length -lt 20) { continue }
            
            if ($btnContent -match $yellowBG) {
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
    "47" = @{ Id = "board_rajshahi_2021"; Name = "রাজশাহী বোর্ড ২০২১" }
    "48" = @{ Id = "board_mymensingh_2021"; Name = "ময়মনসিংহ বোর্ড ২০২১" }
    "50" = @{ Id = "board_jashore_2021"; Name = "যশোর বোর্ড ২০২১" }
    "51" = @{ Id = "board_cumilla_2021"; Name = "কুমিল্লা বোর্ড ২০২১" }
    "52" = @{ Id = "board_chattogram_2021"; Name = "চট্টগ্রাম বোর্ড ২০২১" }
    "53" = @{ Id = "board_sylhet_2021"; Name = "সিলেট বোর্ড ২০২১" }
    "54" = @{ Id = "board_barishal_2021"; Name = "বরিশাল বোর্ড ২০২১" }
    "55" = @{ Id = "board_dhaka_2020"; Name = "ঢাকা বোর্ড ২০২০" }
    "56" = @{ Id = "board_mymensingh_2020"; Name = "ময়মনসিংহ বোর্ড ২০২০" }
    "57" = @{ Id = "board_rajshahi_2020"; Name = "রাজশাহী বোর্ড ২০২০" }
    "58" = @{ Id = "board_dinajpur_2020"; Name = "দিনাজপুর বোর্ড ২০২০" }
    "59" = @{ Id = "board_cumilla_2020"; Name = "কুমিল্লা বোর্ড ২০২০" }
    "60" = @{ Id = "board_sylhet_2020"; Name = "সিলেট বোর্ড ২০২০" }
    "61" = @{ Id = "board_jashore_2020"; Name = "যশোর বোর্ড ২০২০" }
    "62" = @{ Id = "board_chattogram_2020"; Name = "চট্টগ্রাম বোর্ড ২০২০" }
    "63" = @{ Id = "board_barishal_2020"; Name = "বরিশাল বোর্ড ২০২০" }
    "64" = @{ Id = "board_dhaka_2019"; Name = "ঢাকা বোর্ড ২০১৯" }
    "65" = @{ Id = "board_rajshahi_2019"; Name = "রাজশাহী বোর্ড ২০১৯" }
    "66" = @{ Id = "board_cumilla_2019"; Name = "কুমিল্লা বোর্ড ২০১৯" }
    "67" = @{ Id = "board_sylhet_2019"; Name = "সিলেট বোর্ড ২০১৯" }
    "68" = @{ Id = "board_chattogram_2019"; Name = "চট্টগ্রাম বোর্ড ২০১৯" }
    "69" = @{ Id = "board_dinajpur_2019"; Name = "দিনাজপুর বোর্ড ২০১৯" }
    "70" = @{ Id = "board_barishal_2019"; Name = "বরিশাল বোর্ড ২০১৯" }
    "71" = @{ Id = "board_dhaka_2015"; Name = "ঢাকা বোর্ড ২০১৫" }
    "72" = @{ Id = "board_rajshahi_2015"; Name = "রাজশাহী বোর্ড ২০১৫" }
    "73" = @{ Id = "board_cumilla_2015"; Name = "কুমিল্লা বোর্ড ২০১৫" }
    "74" = @{ Id = "board_dinajpur_2015"; Name = "দিনাজপুর বোর্ড ২০১৫" }
    "75" = @{ Id = "board_sylhet_2015"; Name = "সিলেট বোর্ড ২০১৫" }
    "76" = @{ Id = "board_chattogram_2015"; Name = "চট্টগ্রাম বোর্ড ২০১৫" }
    "77" = @{ Id = "board_jashore_2015"; Name = "যশোর বোর্ড ২০১৫" }
    "78" = @{ Id = "board_barishal_2015"; Name = "বরিশাল বোর্ড ২০১৫" }
    # === New files 79-115 ===
    "79" = @{ Id = "board_chattogram_2016"; Name = "চট্টগ্রাম বোর্ড ২০১৬" }
    "80" = @{ Id = "board_sylhet_2016"; Name = "সিলেট বোর্ড ২০১৬" }
    "81" = @{ Id = "board_jashore_2016"; Name = "যশোর বোর্ড ২০১৬" }
    "82" = @{ Id = "board_barishal_2016"; Name = "বরিশাল বোর্ড ২০১৬" }
    "83" = @{ Id = "board_chattogram_2017"; Name = "চট্টগ্রাম বোর্ড ২০১৭" }
    "84" = @{ Id = "board_sylhet_2017"; Name = "সিলেট বোর্ড ২০১৭" }
    "85" = @{ Id = "board_jashore_2017"; Name = "যশোর বোর্ড ২০১৭" }
    "86" = @{ Id = "board_barishal_2017"; Name = "বরিশাল বোর্ড ২০১৭" }
    "87" = @{ Id = "board_dhaka_2017"; Name = "ঢাকা বোর্ড ২০১৭" }
    "88" = @{ Id = "board_rajshahi_2017"; Name = "রাজশাহী বোর্ড ২০১৭" }
    "89" = @{ Id = "board_dinajpur_2017"; Name = "দিনাজপুর বোর্ড ২০১৭" }
    "90" = @{ Id = "board_cumilla_2017"; Name = "কুমিল্লা বোর্ড ২০১৭" }
    "91" = @{ Id = "board_all_2018"; Name = "সকল বোর্ড ২০১৮" }
    "92" = @{ Id = "school_rajuk_uttara_model_2025"; Name = "রাজউক উত্তরা মডেল কলেজ ২০২৫" }
    "93" = @{ Id = "school_vikarunnisa_noon_2025"; Name = "ভিকারুননিসা নূন স্কুল এন্ড কলেজ ২০২৫" }
    "94" = @{ Id = "school_ideal_motijheel_2025"; Name = "আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল ২০২৫" }
    "95" = @{ Id = "school_dhaka_residential_model_2025"; Name = "ঢাকা রেসিডেনসিয়াল মডেল কলেজ ২০২৫" }
    "96" = @{ Id = "school_adamjee_cantonment_2025"; Name = "আদমজী ক্যান্টনমেন্ট পাবলিক স্কুল ২০২৫" }
    "97" = @{ Id = "school_holy_cross_2025"; Name = "হলি ক্রস উচ্চ বালিকা বিদ্যালয় ২০২৫" }
    "98" = @{ Id = "school_st_joseph_2025"; Name = "সেন্ট যোসেফ উচ্চ মাধ্যমিক বিদ্যালয় ২০২৫" }
    "99" = @{ Id = "school_birshreshtha_munshi_2025"; Name = "বীরশ্রেষ্ঠ মুন্সী আব্দুর রউফ পাবলিক কলেজ ২০২৫" }
    "100" = @{ Id = "school_milestone_2025"; Name = "মাইলস্টোন কলেজ ২০২৫" }
    "101" = @{ Id = "school_cantonment_mymensingh_2025"; Name = "ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, মোমেনশাহী ২০২৫" }
    "102" = @{ Id = "school_rajuk_uttara_2024"; Name = "রাজউক উত্তরা কলেজ ২০২৪" }
    "103" = @{ Id = "school_vikarunnisa_noon_college_2024"; Name = "ভিকারুননিসা নূন কলেজ ২০২৪" }
    "104" = @{ Id = "school_ideal_motijheel_college_2024"; Name = "আইডিয়াল কলেজ, মতিঝিল ২০২৪" }
    "105" = @{ Id = "school_dhaka_residential_2024"; Name = "ঢাকা রেসিডেনসিয়াল কলেজ ২০২৪" }
    "106" = @{ Id = "school_adamjee_cantonment_public_2024"; Name = "আদমজী ক্যান্ট. পাবলিক স্কুল ২০২৪" }
    "107" = @{ Id = "school_holy_cross_college_2024"; Name = "হলি ক্রস কলেজ ২০২৪" }
    "108" = @{ Id = "school_milestone_2024"; Name = "মাইলস্টোন কলেজ ২০২৪" }
    "109" = @{ Id = "school_motijheel_model_2024"; Name = "মতিঝিল মডেল স্কুল এন্ড কলেজ ২০২৪" }
    "110" = @{ Id = "school_st_joseph_college_2024"; Name = "সেন্ট যোসেফ কলেজ ২০২৪" }
    "111" = @{ Id = "school_cambrian_2024"; Name = "ক্যামব্রিয়ান স্কুল এন্ড কলেজ ২০২৪" }
    "112" = @{ Id = "board_dhaka_2016"; Name = "ঢাকা বোর্ড ২০১৬" }
    "113" = @{ Id = "board_rajshahi_2016"; Name = "রাজশাহী বোর্ড ২০১৬" }
    "114" = @{ Id = "board_dinajpur_2016"; Name = "দিনাজপুর বোর্ড ২০১৬" }
    "115" = @{ Id = "board_cumilla_2016"; Name = "কুমিল্লা বোর্ড ২০১৬" }
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
