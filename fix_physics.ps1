$ErrorActionPreference = 'Stop'
$base = 'docs/hsc/physics 1st'

# ===== Fix chapter_1.json =====
$c1 = Get-Content -LiteralPath "$base/chapter_1.json" -Encoding UTF8 -Raw
$c1Json = $c1 | ConvertFrom-Json

# Track seen IDs: keep first occurrence
$seen = @{}
$newList = @()
$nextId = 340
foreach ($item in $c1Json) {
    $id = $item.id
    if ($seen.ContainsKey($id)) {
        # Reassign 2nd ID 34 to 340
        if ($id -eq 34) {
            $item.id = $nextId
            $newList += $item
        }
        # Skip other duplicates (32, 33)
        continue
    }
    $seen[$id] = $true
    $newList += $item
}

# Fix ID 17: "description" -> "explanation"
for ($i = 0; $i -lt $newList.Count; $i++) {
    if ($newList[$i].id -eq 17 -and $null -ne $newList[$i].description) {
        $newList[$i] | Add-Member -MemberType NoteProperty -Name 'explanation' -Value $newList[$i].description -Force
        $newList[$i].PSObject.Properties.Remove('description')
    }
}

# Fix ID 11 option D: "১৯০০" -> "১৯২০"
for ($i = 0; $i -lt $newList.Count; $i++) {
    if ($newList[$i].id -eq 11) {
        $newList[$i].options.D = '১৯২০'
    }
}

# Fix ID 22 option B: "d²/6h + h/2" -> "d²/8h + h/4"
for ($i = 0; $i -lt $newList.Count; $i++) {
    if ($newList[$i].id -eq 22) {
        $newList[$i].options.B = 'd²/8h + h/4'
    }
}

$c1 = $newList | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_1.json", $c1, [System.Text.Encoding]::UTF8)
"chapter_1.json: done ($($newList.Count) questions)"

# ===== Fix chapter_2.json - ID 40 description -> explanation =====
$c2 = Get-Content -LiteralPath "$base/chapter_2.json" -Encoding UTF8 -Raw
$c2Json = $c2 | ConvertFrom-Json
for ($i = 0; $i -lt $c2Json.Count; $i++) {
    if ($c2Json[$i].id -eq 40 -and $null -ne $c2Json[$i].description) {
        $c2Json[$i] | Add-Member -MemberType NoteProperty -Name 'explanation' -Value $c2Json[$i].description -Force
        $c2Json[$i].PSObject.Properties.Remove('description')
    }
}
$c2 = $c2Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_2.json", $c2, [System.Text.Encoding]::UTF8)
"chapter_2.json: done"

# ===== Fix chapter_3.json - ID 78 duplicate option C =====
$c3 = Get-Content -LiteralPath "$base/chapter_3.json" -Encoding UTF8 -Raw
$c3Json = $c3 | ConvertFrom-Json
for ($i = 0; $i -lt $c3Json.Count; $i++) {
    if ($c3Json[$i].id -eq 78) {
        $c3Json[$i].options.C = "v² = v₀² + 2as"
    }
}
$c3 = $c3Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_3.json", $c3, [System.Text.Encoding]::UTF8)
"chapter_3.json: done"

# ===== Fix chapter_5.json =====
$c5 = Get-Content -LiteralPath "$base/chapter_5.json" -Encoding UTF8 -Raw
$c5Json = $c5 | ConvertFrom-Json
for ($i = 0; $i -lt $c5Json.Count; $i++) {
    if ($c5Json[$i].id -eq 130) {
        $c5Json[$i].options.B = "90° < θ ≤ 180°"
    }
    if ($c5Json[$i].id -eq 143) {
        $c5Json[$i].options.C = "P = F/v²"
    }
}
$c5 = $c5Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_5.json", $c5, [System.Text.Encoding]::UTF8)
"chapter_5.json: done"

# ===== Fix chapter_6.json =====
$c6 = Get-Content -LiteralPath "$base/chapter_6.json" -Encoding UTF8 -Raw
$c6Json = $c6 | ConvertFrom-Json
for ($i = 0; $i -lt $c6Json.Count; $i++) {
    if ($c6Json[$i].id -eq 164) {
        $c6Json[$i].options.D = "1:8:27"
    }
    if ($c6Json[$i].id -eq 168) {
        $c6Json[$i].options.D = "g = GM/d"
    }
}
$c6 = $c6Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_6.json", $c6, [System.Text.Encoding]::UTF8)
"chapter_6.json: done"

# ===== Fix chapter_9.json - ID 282 duplicate option D =====
$c9 = Get-Content -LiteralPath "$base/chapter_9.json" -Encoding UTF8 -Raw
$c9Json = $c9 | ConvertFrom-Json
for ($i = 0; $i -lt $c9Json.Count; $i++) {
    if ($c9Json[$i].id -eq 282) {
        $c9Json[$i].options.D = "I = 2π²f²vA²ρ/2"
    }
}
$c9 = $c9Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_9.json", $c9, [System.Text.Encoding]::UTF8)
"chapter_9.json: done"

# ===== Fix chapter_10.json - ID 328 duplicate option B =====
$c10 = Get-Content -LiteralPath "$base/chapter_10.json" -Encoding UTF8 -Raw
$c10Json = $c10 | ConvertFrom-Json
for ($i = 0; $i -lt $c10Json.Count; $i++) {
    if ($c10Json[$i].id -eq 328) {
        $c10Json[$i].options.B = "C_rms = √(3RT/2M)"
    }
}
$c10 = $c10Json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$base/chapter_10.json", $c10, [System.Text.Encoding]::UTF8)
"chapter_10.json: done"

"`nAll physics fixes complete!"
