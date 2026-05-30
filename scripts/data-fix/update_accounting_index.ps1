$indexPath = "D:\Tanvir Mahfuz\80-20-exam\public\hsc\index.json"
$jsonDir = "D:\Tanvir Mahfuz\80-20-exam\public\hsc\accounting_1st"
$encoding = [System.Text.Encoding]::UTF8

$indexContent = [System.IO.File]::ReadAllText($indexPath, $encoding)
$index = $indexContent | ConvertFrom-Json

$acc1Subject = $null
foreach ($sub in $index.subjects) {
    if ($sub.id -eq 'accounting_1st') { $acc1Subject = $sub; break }
}
if (-not $acc1Subject) { Write-Output "accounting_1st not found!"; exit 1 }

# Remove existing year_* topics
$chapterTopics = @()
foreach ($t in $acc1Subject.topics) {
    if ($t.id -notlike 'year_*') { $chapterTopics += $t }
}

$examFiles = Get-ChildItem -Path $jsonDir -Filter "*.json" | Where-Object { $_.Name -notlike 'chapter_*' } | Sort-Object Name

function Get-Year([string]$n) {
    $bn = $n -replace '[০১২৩৪৫৬৭৮৯].*$', ''
    $m = [regex]::Match($n, '[০১২৩৪৫৬৭৮৯]{4}')
    if ($m.Success) {
        $s = $m.Value
        $s = $s -replace '০', '0' -replace '১', '1' -replace '২', '2' -replace '৩', '3' -replace '৪', '4'
        $s = $s -replace '৫', '5' -replace '৬', '6' -replace '৭', '7' -replace '৮', '8' -replace '৯', '9'
        return $s
    }
    $m2 = [regex]::Match($n, '(\d{4})')
    if ($m2.Success) { return $m2.Groups[1].Value }
    return ""
}

$yearBuckets = @{}
foreach ($f in $examFiles) {
    $year = Get-Year -n $f.BaseName
    if ([string]::IsNullOrWhiteSpace($year)) { continue }
    if (-not $yearBuckets.ContainsKey($year)) { $yearBuckets[$year] = @() }
    $yearBuckets[$year] += $f
}

$newTopics = @()
$sortedYears = $yearBuckets.Keys | Sort-Object
$topicIdCounter = 1000

foreach ($yr in $sortedYears) {
    $files = $yearBuckets[$yr]
    $boardFiles = @(); $collegeFiles = @()
    foreach ($f in $files) {
        if ($f.BaseName -match 'বোর্ড') { $boardFiles += $f } else { $collegeFiles += $f }
    }
    $boardFiles = $boardFiles | Sort-Object Name
    $collegeFiles = $collegeFiles | Sort-Object Name
    
    $chapters = @()
    foreach ($bf in $boardFiles) {
        $topicIdCounter++; $bn = $bf.BaseName
        $chapters += @{ id = "hsc_acc1_${topicIdCounter}"; name = $bn; name_bn = $bn; name_en = $bn; file_bn = "/hsc/accounting_1st/$($bf.Name)" }
    }
    foreach ($cf in $collegeFiles) {
        $topicIdCounter++; $bn = $cf.BaseName
        $chapters += @{ id = "hsc_acc1_${topicIdCounter}"; name = $bn; name_bn = $bn; name_en = $bn; file_bn = "/hsc/accounting_1st/$($cf.Name)" }
    }
    
    $newTopics += @{ id = "year_${yr}"; name = $yr; name_bn = "${yr} সাল"; name_en = $yr; chapters = $chapters }
}

$acc1Subject.topics = $chapterTopics + $newTopics

$json = $index | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($indexPath, $json, $encoding)
Write-Output "Done: $($chapterTopics.Count) + $($newTopics.Count) topics"
foreach ($nt in $newTopics) {
    Write-Output "  $($nt.id): $($nt.chapters.Count) exams"
}
