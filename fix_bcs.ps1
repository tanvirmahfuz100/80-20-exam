$ErrorActionPreference = 'Stop'
$base = 'public/bcs'

function Fix-File {
    param($file, $fixes)
    
    $path = "$base/$file"
    if (-not (Test-Path -LiteralPath $path)) {
        "  SKIP: $file not found"
        return
    }
    
    $json = Get-Content -LiteralPath $path -Encoding UTF8 -Raw | ConvertFrom-Json
    $changed = 0
    
    foreach ($fix in $fixes) {
        $targetId = $fix.id
        $item = $json | Where-Object { $_.id -eq $targetId }
        if (-not $item) {
            "  WARN: ID $targetId not found in $file"
            continue
        }
        
        if ($fix.answer -eq 'null') {
            $item.answer = $null
        } else {
            $item.answer = $fix.answer
        }
        
        if ($fix.confidence) {
            if ($null -eq $item.confidence) {
                $item | Add-Member -MemberType NoteProperty -Name 'confidence' -Value $fix.confidence -Force
            } else {
                $item.confidence = $fix.confidence
            }
        }
        
        $changed++
    }
    
    if ($changed -gt 0) {
        $out = $json | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($path, $out, [System.Text.Encoding]::UTF8)
        "  $($file): $changed fixes applied"
    } else {
        "  $($file): no changes needed"
    }
}

# ===== Fix empty answers (inferable ones) =====
"--- Empty Answers (inferable) ---"

# bcs_10 id 13: 'Competent' synonym -> Capable = C
Fix-File -file 'bcs_10.json' -fixes @(@{id=13; answer='C'})

# bcs_11 id 99: 15÷15×15 = 225 -> C
Fix-File -file 'bcs_11.json' -fixes @(@{id=99; answer='C'})

# bcs_12 id 13: 'Misspell' -> C
Fix-File -file 'bcs_12.json' -fixes @(@{id=13; answer='C'})

# bcs_20 id 16: "the University will employ me" -> C
Fix-File -file 'bcs_20.json' -fixes @(@{id=16; answer='C'})

# bcs_23 id 95: weighted avg -> D
Fix-File -file 'bcs_23.json' -fixes @(@{id=95; answer='D'})

# bcs_26 id 38: "Deny" -> D
Fix-File -file 'bcs_26.json' -fixes @(@{id=38; answer='D'})

# ===== Fix empty answers (non-inferable -> null) =====
"--- Empty Answers (non-inferable -> null) ---"

Fix-File -file 'bcs_11.json' -fixes @(@{id=41; answer='null'})
Fix-File -file 'bcs_13.json' -fixes @(@{id=37; answer='null'})
Fix-File -file 'bcs_14.json' -fixes @(@{id=74; answer='null'})
Fix-File -file 'bcs_16.json' -fixes @(
    @{id=36; answer='null'},
    @{id=74; answer='null'},
    @{id=85; answer='null'}
)
Fix-File -file 'bcs_18.json' -fixes @(@{id=46; answer='null'})
Fix-File -file 'bcs_21.json' -fixes @(@{id=6; answer='null'})
Fix-File -file 'bcs_23.json' -fixes @(@{id=42; answer='null'})
Fix-File -file 'bcs_24.json' -fixes @(@{id=68; answer='null'})
Fix-File -file 'bcs_27.json' -fixes @(
    @{id=38; answer='null'},
    @{id=54; answer='null'}
)
Fix-File -file 'bcs_28.json' -fixes @(
    @{id=68; answer='null'},
    @{id=97; answer='null'}
)

# ===== Fix non-standard answers =====
"--- Non-standard answers -> null ---"

Fix-File -file 'bcs_29.json' -fixes @(
    @{id=33; answer='null'},
    @{id=47; answer='null'},
    @{id=66; answer='null'},
    @{id=41; answer='null'}
)
Fix-File -file 'bcs_31.json' -fixes @(@{id=81; answer='null'})
Fix-File -file 'bcs_33.json' -fixes @(@{id=91; answer='null'})
Fix-File -file 'bcs_39.json' -fixes @(
    @{id=13; answer='null'},
    @{id=76; answer='null'}
)

"`nAll BCS fixes complete!"
