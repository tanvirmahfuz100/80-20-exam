<#
.SYNOPSIS
    Converts Bijoy/SutonnyMJ-encoded Bengali text to Unicode Bengali.
.DESCRIPTION
    Takes a file containing Bijoy-encoded text (Windows-1252 ANSI characters
    read as UTF-8) and converts it to proper Unicode Bengali.
.PARAMETER InputFile
    Path to the Bijoy-encoded input file.
.PARAMETER OutputFile
    Path for the Unicode output file. Defaults to input file with _unicode suffix.
.PARAMETER ShowOutput
    Display the converted text in console.
#>
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$InputFile,
    [string]$OutputFile = "",
    [switch]$ShowOutput
)

$ErrorActionPreference = "Stop"

Write-Host "Reading: $InputFile"
$content = [System.IO.File]::ReadAllText((Resolve-Path $InputFile), [System.Text.Encoding]::UTF8)
Write-Host "Read $($content.Length) characters"

$hasanta = [char]0x09CD

# ── Use parallel arrays to avoid PowerShell hashtable case-insensitivity ──
$mapKeys = New-Object System.Collections.ArrayList
$mapVals = New-Object System.Collections.ArrayList

function AddEntry([string]$k, $v) {
    $null = $mapKeys.Add($k)
    if ($v -is [string]) { $null = $mapVals.Add($v) }
    else { $null = $mapVals.Add([string]$v) }
}

function ApplyAll($text, $keys, $vals) {
    for ($i = 0; $i -lt $keys.Count; $i++) {
        $text = $text.Replace([string]$keys[$i], [string]$vals[$i])
    }
    return $text
}

# ── Pre-map ──
AddEntry 'yy' 'y'
AddEntry 'vv' 'v'
AddEntry 'y&' 'y'
AddEntry ([char]0x201E + '&') ([string][char]0x201E)
AddEntry ([char]0x2021 + 'u') ('u' + [char]0x2021)
AddEntry 'wu' 'uw'
$preKeyEnd = $mapKeys.Count

# ── Glyph map ──
# Vowels
AddEntry 'Av' ([string][char]0x0986)
AddEntry 'A'  ([string][char]0x0985)
AddEntry 'B'  ([string][char]0x0987)
AddEntry 'C'  ([string][char]0x0988)
AddEntry 'D'  ([string][char]0x0989)
AddEntry 'E'  ([string][char]0x098A)
AddEntry 'F'  ([string][char]0x098B)
AddEntry 'G'  ([string][char]0x098F)
AddEntry 'H'  ([string][char]0x0990)
AddEntry 'I'  ([string][char]0x0993)
AddEntry 'J'  ([string][char]0x0994)
# Consonants
AddEntry 'K'  ([string][char]0x0995)
AddEntry 'L'  ([string][char]0x0996)
AddEntry 'M'  ([string][char]0x0997)
AddEntry 'N'  ([string][char]0x0998)
AddEntry 'O'  ([string][char]0x0999)
AddEntry 'P'  ([string][char]0x099A)
AddEntry 'Q'  ([string][char]0x099B)
AddEntry 'R'  ([string][char]0x099C)
AddEntry 'S'  ([string][char]0x099D)
AddEntry 'T'  ([string][char]0x099E)
AddEntry 'U'  ([string][char]0x099F)
AddEntry 'V'  ([string][char]0x09A0)
AddEntry 'W'  ([string][char]0x09A1)
AddEntry 'X'  ([string][char]0x09A2)
AddEntry 'Y'  ([string][char]0x09A3)
AddEntry 'Z'  ([string][char]0x09A4)
AddEntry '_'  ([string][char]0x09A5)
AddEntry '`'  ([string][char]0x09A6)
AddEntry 'a'  ([string][char]0x09A7)
AddEntry 'b'  ([string][char]0x09A8)
AddEntry 'c'  ([string][char]0x09AA)
AddEntry 'd'  ([string][char]0x09AB)
AddEntry 'e'  ([string][char]0x09AC)
AddEntry 'f'  ([string][char]0x09AD)
AddEntry 'g'  ([string][char]0x09AE)
AddEntry 'h'  ([string][char]0x09AF)
AddEntry 'i'  ([string][char]0x09B0)
AddEntry 'j'  ([string][char]0x09B2)
AddEntry 'k'  ([string][char]0x09B6)
AddEntry 'l'  ([string][char]0x09B7)
AddEntry 'm'  ([string][char]0x09B8)
AddEntry 'n'  ([string][char]0x09B9)
AddEntry 'o'  ([string][char]0x09DC)
AddEntry 'p'  ([string][char]0x09DD)
AddEntry 'q'  ([string][char]0x09DF)
AddEntry 'r'  ([string][char]0x09CE)
AddEntry 's'  ([string][char]0x0982)
AddEntry 't'  ([string][char]0x0983)
AddEntry 'u'  ([string][char]0x0981)
# Digits
AddEntry '0'  ([string][char]0x09E6)
AddEntry '1'  ([string][char]0x09E7)
AddEntry '2'  ([string][char]0x09E8)
AddEntry '3'  ([string][char]0x09E9)
AddEntry '4'  ([string][char]0x09EA)
AddEntry '5'  ([string][char]0x09EB)
AddEntry '6'  ([string][char]0x09EC)
AddEntry '7'  ([string][char]0x09ED)
AddEntry '8'  ([string][char]0x09EE)
AddEntry '9'  ([string][char]0x09EF)
# Kar signs
AddEntry 'v'  ([string][char]0x09BE)
AddEntry 'w'  ([string][char]0x09BF)
AddEntry 'x'  ([string][char]0x09C0)
AddEntry 'y'  ([string][char]0x09C1)
AddEntry 'z'  ([string][char]0x09C1)
AddEntry ([string][char]0x201C) ([string][char]0x09C1)
AddEntry ([string][char]0x2013) ([string][char]0x09C1)
AddEntry ([string][char]0x0192) ([string][char]0x09C2)
AddEntry ([string][char]0x201A) ([string][char]0x09C2)
AddEntry '~'  ([string][char]0x09C2)
AddEntry ([string][char]0x201E + [string][char]0x201E) ([string][char]0x09C3)
AddEntry ([string][char]0x201E) ([string][char]0x09C3)
AddEntry ([string][char]0x2026) ([string][char]0x09C3)
AddEntry ([string][char]0x2020) ([string][char]0x09C7)
AddEntry ([string][char]0x2021) ([string][char]0x09C7)
AddEntry ([string][char]0x02C6) ([string][char]0x09C8)
AddEntry ([string][char]0x2030) ([string][char]0x09C8)
AddEntry ([string][char]0x0160) ([string][char]0x09D7)
AddEntry '|'  ([string][char]0x0964)
AddEntry '&'  ([string]$hasanta + [string][char]0x200C)
# Conjuncts
AddEntry '^'  ([string]$hasanta + [string][char]0x09AC)
AddEntry ([string][char]0x2018) ([string][char]0x099A + [string]$hasanta)
AddEntry ([string][char]0x2019) ([string][char]0x09A5 + [string]$hasanta)
AddEntry ([string][char]0x2039) ([string]$hasanta + [string][char]0x0995)
AddEntry ([string][char]0x0152) ([string]$hasanta + [string][char]0x0995 + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x201D) ([string][char]0x099A + [string]$hasanta)
AddEntry ([string][char]0x2014) ([string]$hasanta + [string][char]0x09A4)
AddEntry ([string][char]0x02DC) ([string][char]0x09A6 + [string]$hasanta)
AddEntry ([string][char]0x2122) ([string][char]0x09A6 + [string]$hasanta)
AddEntry ([string][char]0x0161) ([string][char]0x09A8 + [string]$hasanta)
AddEntry ([string][char]0x203A) ([string][char]0x09A8 + [string]$hasanta)
AddEntry ([string][char]0x0153) ([string]$hasanta + [string][char]0x09A8)
AddEntry ([string][char]0x0178) ([string]$hasanta + [string][char]0x09AC)
AddEntry ([string][char]0x00A1) ([string]$hasanta + [string][char]0x09AC)
AddEntry ([string][char]0x00A2) ([string]$hasanta + [string][char]0x09AD)
AddEntry ([string][char]0x00A3) ([string]$hasanta + [string][char]0x09AD + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00A4) ([string][char]0x09AE + [string]$hasanta)
AddEntry ([string][char]0x00A5) ([string]$hasanta + [string][char]0x09AE)
AddEntry ([string][char]0x00A6) ([string]$hasanta + [string][char]0x09AC)
AddEntry ([string][char]0x00A7) ([string]$hasanta + [string][char]0x09AE)
AddEntry ([string][char]0x00A8) ([string]$hasanta + [string][char]0x09AF)
AddEntry ([string][char]0x00A9) ([string][char]0x09B0 + [string]$hasanta)
AddEntry ([string][char]0x00AA) ([string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00AB) ([string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00AC) ([string]$hasanta + [string][char]0x09B2)
AddEntry ([string][char]0x00AD) ([string]$hasanta + [string][char]0x09B2)
AddEntry ([string][char]0x00AE) ([string][char]0x09B7 + [string]$hasanta)
AddEntry ([string][char]0x00AF) ([string][char]0x09B8 + [string]$hasanta)
AddEntry ([string][char]0x00B0) ([string][char]0x0995 + [string]$hasanta + [string][char]0x0995)
AddEntry ([string][char]0x00B1) ([string][char]0x0995 + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00B2) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09B7 + [string]$hasanta + [string][char]0x09A3)
AddEntry ([string][char]0x00B3) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09A4)
AddEntry ([string][char]0x00B4) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09AE)
AddEntry ([string][char]0x00B5) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00B6) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09B7)
AddEntry ([string][char]0x00B7) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09B8)
AddEntry ([string][char]0x00B8) ([string][char]0x0997 + [string][char]0x09C1)
AddEntry ([string][char]0x00B9) ([string][char]0x099C + [string]$hasanta + [string][char]0x099E)
AddEntry ([string][char]0x00BA) ([string][char]0x0997 + [string]$hasanta + [string][char]0x09A6)
AddEntry ([string][char]0x00BB) ([string][char]0x0997 + [string]$hasanta + [string][char]0x09A7)
AddEntry ([string][char]0x00BC) ([string][char]0x0999 + [string]$hasanta + [string][char]0x0995)
AddEntry ([string][char]0x00BD) ([string][char]0x0999 + [string]$hasanta + [string][char]0x0997)
AddEntry ([string][char]0x00BE) ([string][char]0x099C + [string]$hasanta + [string][char]0x099C)
AddEntry ([string][char]0x00BF) ([string]$hasanta + [string][char]0x09A4 + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00C0) ([string][char]0x099C + [string]$hasanta + [string][char]0x099D)
AddEntry ([string][char]0x00C1) ([string][char]0x099C + [string]$hasanta + [string][char]0x099E)
AddEntry ([string][char]0x00C2) ([string][char]0x099E + [string]$hasanta + [string][char]0x099A)
AddEntry ([string][char]0x00C3) ([string][char]0x099E + [string]$hasanta + [string][char]0x099B)
AddEntry ([string][char]0x00C4) ([string][char]0x099E + [string]$hasanta + [string][char]0x099C)
AddEntry ([string][char]0x00C5) ([string][char]0x099E + [string]$hasanta + [string][char]0x099D)
AddEntry ([string][char]0x00C6) ([string][char]0x099F + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00C7) ([string][char]0x09A1 + [string]$hasanta + [string][char]0x09A1)
AddEntry ([string][char]0x00C8) ([string][char]0x09A3 + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00C9) ([string][char]0x09A3 + [string]$hasanta + [string][char]0x09A0)
AddEntry ([string][char]0x00CA) ([string][char]0x09A3 + [string]$hasanta + [string][char]0x09A1)
AddEntry ([string][char]0x00CB) ([string][char]0x09A4 + [string]$hasanta + [string][char]0x09A4)
AddEntry ([string][char]0x00CC) ([string][char]0x09A4 + [string]$hasanta + [string][char]0x09A5)
AddEntry ([string][char]0x00CD) ([string][char]0x09A4)
AddEntry ([string][char]0x00CE) ([string][char]0x09A4 + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00CF) ([string][char]0x09A6 + [string]$hasanta + [string][char]0x09A6)
AddEntry ([string][char]0x00D6) ([string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00D7) ([string][char]0x09A6 + [string]$hasanta + [string][char]0x09A7)
AddEntry ([string][char]0x00D8) ([string][char]0x09A6 + [string]$hasanta + [string][char]0x09AC)
AddEntry ([string][char]0x00D9) ([string][char]0x09A6 + [string]$hasanta + [string][char]0x09AE)
AddEntry ([string][char]0x00DA) ([string][char]0x09A8 + [string]$hasanta + [string][char]0x09A0)
AddEntry ([string][char]0x00DB) ([string][char]0x09A8 + [string]$hasanta + [string][char]0x09A1)
AddEntry ([string][char]0x00DC) ([string][char]0x09A8 + [string]$hasanta + [string][char]0x09A7)
AddEntry ([string][char]0x00DD) ([string][char]0x09A8 + [string]$hasanta + [string][char]0x09B8)
AddEntry ([string][char]0x00DE) ([string][char]0x09AA + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00DF) ([string][char]0x09AA + [string]$hasanta + [string][char]0x09A4)
AddEntry ([string][char]0x00E0) ([string][char]0x09AA + [string]$hasanta + [string][char]0x09AA)
AddEntry ([string][char]0x00E1) ([string][char]0x09AA + [string]$hasanta + [string][char]0x09B8)
AddEntry ([string][char]0x00E2) ([string][char]0x09AC + [string]$hasanta + [string][char]0x099C)
AddEntry ([string][char]0x00E3) ([string][char]0x09AC + [string]$hasanta + [string][char]0x09A6)
AddEntry ([string][char]0x00E4) ([string][char]0x09AC + [string]$hasanta + [string][char]0x09A7)
AddEntry ([string][char]0x00E5) ([string][char]0x09AD + [string]$hasanta + [string][char]0x09B0)
AddEntry ([string][char]0x00E6) ([string][char]0x09C1)
AddEntry ([string][char]0x00E7) ([string][char]0x09AE + [string]$hasanta + [string][char]0x09AB)
AddEntry ([string][char]0x00E8) ([string]$hasanta + [string][char]0x09A8)
AddEntry ([string][char]0x00E9) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x0995)
AddEntry ([string][char]0x00EA) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x0997)
AddEntry ([string][char]0x00EB) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00EC) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x09A1)
AddEntry ([string][char]0x00ED) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x09AA)
AddEntry ([string][char]0x00EE) ([string][char]0x09B2 + [string]$hasanta + [string][char]0x09AB)
AddEntry ([string][char]0x00EF) ([string][char]0x09B6 + [string][char]0x09C1)
AddEntry ([string][char]0x00FF) ([string][char]0x0995 + [string]$hasanta + [string][char]0x09B7)
AddEntry ([string][char]0x00F0) ([string][char]0x09B6 + [string]$hasanta + [string][char]0x099A)
AddEntry ([string][char]0x00F1) ([string][char]0x09B6 + [string]$hasanta + [string][char]0x099B)
AddEntry ([string][char]0x00F2) ([string][char]0x09B7 + [string]$hasanta + [string][char]0x09A3)
AddEntry ([string][char]0x00F3) ([string][char]0x09B7 + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00F4) ([string][char]0x09B7 + [string]$hasanta + [string][char]0x09A0)
AddEntry ([string][char]0x00F5) ([string][char]0x09B7 + [string]$hasanta + [string][char]0x09AB)
AddEntry ([string][char]0x00F6) ([string][char]0x09B8 + [string]$hasanta + [string][char]0x0996)
AddEntry ([string][char]0x00F7) ([string][char]0x09B8 + [string]$hasanta + [string][char]0x099F)
AddEntry ([string][char]0x00F8) ([string]$hasanta + [string][char]0x09B2)
AddEntry ([string][char]0x00F9) ([string][char]0x09B8 + [string]$hasanta + [string][char]0x09AB)
AddEntry ([string][char]0x00FA) ([string]$hasanta + [string][char]0x09AA)
AddEntry ([string][char]0x00FB) ([string][char]0x09B9 + [string][char]0x09C1)
AddEntry ([string][char]0x00FC) ([string][char]0x09B9 + [string][char]0x09C3)
AddEntry ([string][char]0x00FD) ([string][char]0x09B9 + [string]$hasanta + [string][char]0x09A8)
AddEntry ([string][char]0x00FE) ([string][char]0x09B9 + [string]$hasanta + [string][char]0x09AE)
$glyphEnd = $mapKeys.Count

# ── Post-map ──
AddEntry ([string][char]0x09E6 + [string][char]0x0983) ([string][char]0x09E6 + ':')
AddEntry ([string][char]0x09E7 + [string][char]0x0983) ([string][char]0x09E7 + ':')
AddEntry ([string][char]0x09E8 + [string][char]0x0983) ([string][char]0x09E8 + ':')
AddEntry ([string][char]0x09E9 + [string][char]0x0983) ([string][char]0x09E9 + ':')
AddEntry ([string][char]0x09EA + [string][char]0x0983) ([string][char]0x09EA + ':')
AddEntry ([string][char]0x09EB + [string][char]0x0983) ([string][char]0x09EB + ':')
AddEntry ([string][char]0x09EC + [string][char]0x0983) ([string][char]0x09EC + ':')
AddEntry ([string][char]0x09ED + [string][char]0x0983) ([string][char]0x09ED + ':')
AddEntry ([string][char]0x09EE + [string][char]0x0983) ([string][char]0x09EE + ':')
AddEntry ([string][char]0x09EF + [string][char]0x0983) ([string][char]0x09EF + ':')
AddEntry (' ' + [string][char]0x0983) ' :'
AddEntry ("`n" + [string][char]0x0983) "`n:"
AddEntry ([string][char]0x0985 + [string][char]0x09BE) ([string][char]0x0986)

# ── Bengali Unicode helpers ──
$preKarsSet = @([char]0x09BF, [char]0x09C8, [char]0x09C7)
$postKarsSet = @([char]0x09BE, [char]0x09CB, [char]0x09CC, [char]0x09D7, [char]0x09C1, [char]0x09C2, [char]0x09C0, [char]0x09C3)
$banjonSet = @(
    [char]0x0995,[char]0x0996,[char]0x0997,[char]0x0998,[char]0x0999,
    [char]0x099A,[char]0x099B,[char]0x099C,[char]0x099D,[char]0x099E,
    [char]0x099F,[char]0x09A0,[char]0x09A1,[char]0x09A2,[char]0x09A3,
    [char]0x09A4,[char]0x09A5,[char]0x09A6,[char]0x09A7,[char]0x09A8,
    [char]0x09AA,[char]0x09AB,[char]0x09AC,[char]0x09AD,[char]0x09AE,
    [char]0x09AF,[char]0x09B0,[char]0x09B2,[char]0x09B6,[char]0x09B7,
    [char]0x09B8,[char]0x09B9,[char]0x09DC,[char]0x09DD,[char]0x09DF,
    [char]0x09CE,[char]0x0982,[char]0x0983,[char]0x0981
)
function IsPreKar($c) { return $preKarsSet -contains $c }
function IsPostKar($c) { return $postKarsSet -contains $c }
function IsKar($c) { return $preKarsSet -contains $c -or $postKarsSet -contains $c }
function IsBanjon($c) { return $banjonSet -contains $c }
function IsSpace($c) { return $c -in @(' ',"`t","`n","`r") }

function MoveReph([string]$s) {
    $out = New-Object System.Text.StringBuilder
    $i = 0; $n = $s.Length
    while ($i -lt $n) {
        if ($s[$i] -eq [char]0x09B0 -and ($i+1) -lt $n -and $s[$i+1] -eq $hasanta -and ($i -eq 0 -or $s[$i-1] -ne $hasanta)) {
            $j = 1
            while ($true) {
                $left = $i - $j
                if ($left -lt 0) { break }
                if ((IsBanjon $s[$left]) -and $left -gt 0 -and $s[$left-1] -eq $hasanta) { $j += 2 }
                elseif ($j -eq 1 -and (IsKar $s[$left])) { $j += 1 }
                else { break }
            }
            if ($j -ge 1 -and ($i-$j) -ge 0 -and (IsBanjon $s[$i-$j])) {
                $pop = $j
                $cs = [Math]::Max(0, $out.Length - $pop)
                $cluster = $out.ToString($cs, [Math]::Min($pop, $out.Length - $cs))
                $out.Length = $cs
                $out.Append([char]0x09B0) | Out-Null
                $out.Append($hasanta) | Out-Null
                $out.Append($cluster) | Out-Null
                $i += 2; continue
            }
        }
        $out.Append($s[$i]) | Out-Null
        $i += 1
    }
    return $out.ToString()
}

function SwapHalantAfterKar([string]$s) {
    $arr = $s.ToCharArray()
    $i = 1
    $nukta = [char]0x0981
    while ($i -lt $arr.Length - 1) {
        if ($arr[$i] -eq $hasanta -and ((IsKar $arr[$i-1]) -or $arr[$i-1] -eq $nukta)) {
            $t = $arr[$i-1]; $arr[$i-1] = $arr[$i]; $arr[$i] = $arr[$i+1]; $arr[$i+1] = $t
            $i += 2; continue
        }
        $i += 1
    }
    return -join $arr
}

function SwapRaHalantKar([string]$s) {
    $arr = $s.ToCharArray()
    $i = 1
    while ($i -lt $arr.Length - 1) {
        if ($arr[$i] -eq $hasanta -and $arr[$i-1] -eq [char]0x09B0 -and ($i -lt 2 -or $arr[$i-2] -ne $hasanta) -and (IsKar $arr[$i+1])) {
            $t = $arr[$i-1]; $arr[$i-1] = $arr[$i+1]; $arr[$i] = $t; $arr[$i+1] = $hasanta
            $i += 2; continue
        }
        $i += 1
    }
    return -join $arr
}

function MovePreKars([string]$s) {
    $out = New-Object System.Text.StringBuilder
    $i = 0; $n = $s.Length
    while ($i -lt $n) {
        if ((IsPreKar $s[$i]) -and ($i+1) -lt $n -and -not (IsSpace $s[$i+1])) {
            $j = 1
            while (($i+$j) -lt $n -and (IsBanjon $s[$i+$j])) {
                if (($i+$j+1) -lt $n -and $s[$i+$j+1] -eq $hasanta) { $j += 2 }
                else { break }
            }
            $tailIdx = $i + $j + 1
            $l = 0; $repr = $s[$i]
            if ($s[$i] -eq [char]0x09C7 -and $tailIdx -lt $n -and $s[$tailIdx] -eq [char]0x09BE) { $repr = [char]0x09CB; $l = 1 }
            elseif ($s[$i] -eq [char]0x09C7 -and $tailIdx -lt $n -and $s[$tailIdx] -eq [char]0x09D7) { $repr = [char]0x09CC; $l = 1 }
            $out.Append($s.Substring($i+1, $j)) | Out-Null
            $out.Append($repr) | Out-Null
            $i += $j + $l + 1; continue
        }
        $out.Append($s[$i]) | Out-Null
        $i += 1
    }
    return $out.ToString()
}

function MoveNuktaAfterKar([string]$s) {
    $arr = $s.ToCharArray()
    $nukta = [char]0x0981
    $i = 0
    while ($i -lt $arr.Length - 1) {
        if ($arr[$i] -eq $nukta -and (IsPostKar $arr[$i+1])) {
            $t = $arr[$i]; $arr[$i] = $arr[$i+1]; $arr[$i+1] = $t
            $i += 2; continue
        }
        $i += 1
    }
    return -join $arr
}

function ReArrangeUnicode([string]$text) {
    $text = MoveReph $text
    $text = $text.Replace("$hasanta$hasanta", $hasanta)
    $text = SwapHalantAfterKar $text
    $text = SwapRaHalantKar $text
    $text = MovePreKars $text
    $text = MoveNuktaAfterKar $text
    return $text
}

# ── Main pipeline ──
Write-Host "Phase 1/4: Pre-map..."
$result = ApplyAll $content $mapKeys ($mapKeys[0..($preKeyEnd-1)] | ForEach-Object {$mapVals[$mapKeys.IndexOf($_)]})
# No, simpler: just use indices
function ApplyRange($text, $from, $to) {
    for ($i = $from; $i -lt $to; $i++) {
        $text = $text.Replace([string]$mapKeys[$i], [string]$mapVals[$i])
    }
    return $text
}

$preEnd = $preKeyEnd
Write-Host "Phase 1/4: Pre-map ($preEnd entries)..."
$result = ApplyRange $content 0 $preEnd

Write-Host "Phase 2/4: Glyph map ($($glyphEnd - $preEnd) entries)..."
$result = ApplyRange $result $preEnd $glyphEnd

Write-Host "Phase 3/4: Reordering..."
$result = ReArrangeUnicode $result

Write-Host "Phase 4/4: Post-map..."
$result = ApplyRange $result $glyphEnd $mapKeys.Count

Write-Host "Done. Output length: $($result.Length) chars."

if ($OutputFile -eq "") {
    $OutputFile = [System.IO.Path]::ChangeExtension((Resolve-Path $InputFile).Path, '_unicode.txt')
}
[System.IO.File]::WriteAllText($OutputFile, $result, [System.Text.Encoding]::UTF8)
Write-Host "Saved to: $OutputFile"

if ($ShowOutput) {
    $preview = if ($result.Length -gt 2000) { $result.Substring(0,2000) + "`n... [truncated]" } else { $result }
    Write-Host "`n=== OUTPUT ==="
    Write-Host $preview
}
