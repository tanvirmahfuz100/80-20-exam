param(
    [string]$srcDir = "D:\Tanvir Mahfuz\80-20-exam\docs\web\hsc-bangla-2nd",
    [string]$outDir = "D:\Tanvir Mahfuz\80-20-exam\public\hsc\bangla_2nd"
)

function Get-TextFromPTags {
    param([string]$html)
    $pattern = '<p[^>]*class="[^"]*text-lg[^"]*tracking-wide[^"]*"[^>]*>(.*?)</p>'
    $matches = [regex]::Matches($html, $pattern, 'Singleline')
    $texts = @()
    foreach ($match in $matches) {
        $inner = $match.Groups[1].Value
        $inner = $inner -replace '<br\s*/?>', "`n"
        $inner = $inner -replace '<[^>]+>', ''
        $inner = $inner.Trim()
        if ($inner) {
            $texts += $inner
        }
    }
    if ($texts.Count -gt 0) {
        return $texts -join "`n"
    }
    return ""
}

function Get-ExamName {
    param([string]$html)
    $m = [regex]::Match($html, 'h1 class="header"[^>]*>(.*?)</h1>')
    if ($m.Success) {
        $name = $m.Groups[1].Value -replace '<[^>]+>', ''
        $name = $name.Trim()
        if ($name) { return $name }
    }
    return ""
}

function Get-AllWFullBlocks {
    param([string]$html)
    $blocks = @()
    $pos = 0
    while ($true) {
        $bPos = $html.IndexOf('<div class="w-full"><div class="border', $pos)
        if ($bPos -lt 0) { break }
        
        # Find the end of this block - the matching </div></div> for the outer wrapper
        # Count div depth
        $depth = 1
        $endPos = -1
        for ($i = $bPos + 45; $i -lt $html.Length; $i++) {
            if ($html[$i] -eq '<' -and $i + 5 -lt $html.Length) {
                if ($html.Substring($i, 6) -eq '</div>') {
                    $depth--
                    if ($depth -le 0) {
                        # Verify this is the right closing by checking for next w-full
                        $afterClose = $i + 6
                        # Check if next significant tag is another w-full or it's really the end
                        $endPos = $i + 6
                        break
                    }
                    $i += 5
                }
                elseif ($html.Substring($i, 4) -eq '<div' -and $i + 5 -lt $html.Length -and $html[$i+4] -ne '/') {
                    $depth++
                }
            }
        }
        
        if ($endPos -gt 0) {
            $blockHtml = $html.Substring($bPos, $endPos - $bPos)
            $blocks += @{
                "html" = $blockHtml
                "start" = $bPos
                "end" = $endPos
            }
        }
        
        $pos = if ($endPos -gt $bPos) { $endPos } else { $bPos + 1 }
    }
    return $blocks
}

# Ensure output directory exists
if (-not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$files = Get-ChildItem -Path $srcDir -Filter "*.html" | Sort-Object Name
$fileIndex = 1
$mapping = @()

foreach ($file in $files) {
    Write-Host ("Processing [" + $fileIndex + "/148]: " + $file.Name)
    
    $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $examName = Get-ExamName $html
    if (-not $examName) {
        $examName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    }
    
    # Get all blocks
    $blocks = Get-AllWFullBlocks $html
    
    # Find all h3 section headers
    $h3Pattern = 'h3 class="text-xl[^"]*"[^>]*>(.*?)</h3>'
    $h3Matches = [regex]::Matches($html, $h3Pattern, 'Singleline')
    
    # Build sections
    $sections = @()
    
    if ($h3Matches.Count -gt 0) {
        for ($i = 0; $i -lt $h3Matches.Count; $i++) {
            $rawName = $h3Matches[$i].Groups[1].Value -replace '<[^>]+>', ''
            $rawName = $rawName.Trim()
            # Remove trailing count like (5)
            $sectionName = $rawName -replace '\s*\(\d+\)\s*$', ''
            $sectionName = $sectionName.Trim()
            
            $h3Start = $h3Matches[$i].Index
            $h3End = $h3Start + $h3Matches[$i].Length
            $nextH3Start = if ($i -lt $h3Matches.Count - 1) { $h3Matches[$i+1].Index } else { $html.Length }
            
            # Find blocks that fall within this section
            $sectionBlocks = @()
            foreach ($block in $blocks) {
                if ($block.start -ge $h3End -and $block.start -lt $nextH3Start) {
                    $sectionBlocks += $block
                }
            }
            
            $questions = @()
            $qid = 1
            foreach ($block in $sectionBlocks) {
                $text = Get-TextFromPTags $block.html
                if ($text) {
                    $questions += @{ "id" = $qid; "text" = $text }
                    $qid++
                }
            }
            
            $sections += @{
                "name" = $sectionName
                "questions" = $questions
            }
        }
    } else {
        # No h3 headers - put all in one section
        $questions = @()
        $qid = 1
        foreach ($block in $blocks) {
            $text = Get-TextFromPTags $block.html
            if ($text) {
                $questions += @{ "id" = $qid; "text" = $text }
                $qid++
            }
        }
        $sections += @{
            "name" = $examName
            "questions" = $questions
        }
    }
    
    # Count total questions
    $totalQuestions = 0
    foreach ($s in $sections) {
        $totalQuestions += $s.questions.Count
    }
    
    # Build output JSON
    $output = [ordered]@{
        "_type" = "bangla_written"
        "examName" = $examName
        "totalQuestions" = $totalQuestions
        "sections" = $sections
    }
    
    # Write JSON file
    $jsonContent = $output | ConvertTo-Json -Depth 10
    $outFile = Join-Path -Path $outDir -ChildPath ("$fileIndex.json")
    [System.IO.File]::WriteAllText($outFile, $jsonContent, [System.Text.Encoding]::UTF8)
    
    $mapping += [ordered]@{
        "file" = "$fileIndex.json"
        "count" = $totalQuestions
        "source" = $examName
        "htmlFile" = $file.Name
    }
    
    Write-Host ("  -> " + $fileIndex + ".json (" + $totalQuestions + " questions)")
    $fileIndex++
}

# Write mapping file
$mappingContent = $mapping | ConvertTo-Json -Depth 3
$mapFile = Join-Path -Path $outDir -ChildPath "_mapping.json"
[System.IO.File]::WriteAllText($mapFile, $mappingContent, [System.Text.Encoding]::UTF8)
Write-Host ("`nDone! Processed " + ($fileIndex-1) + " files. Mapping saved to _mapping.json")
