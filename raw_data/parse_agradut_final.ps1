param([string]$InputFile="raw_data/agradut_raw.txt",[string]$OutputDir="public/bank")
$ErrorActionPreference="Stop"
$sw=[System.Diagnostics.Stopwatch]::StartNew()
$content=[System.IO.File]::ReadAllText((Resolve-Path $InputFile),[System.Text.Encoding]::UTF8)
Write-Host "Read $($content.Length) chars"

function TrimStr([string]$s){return ($s -replace '\s+',' ').Trim()}

# Find exam boundaries
$examStarts=@()
foreach($m in [regex]::Matches($content,'অগ্রদূত\s+Recent\s+Job\s+Solution')){
    $p=$m.Index+$m.Length;$l=[Math]::Min(200,$content.Length-$p);$la=$content.Substring($p,$l)
    if($la -match 'সময়\s*:' -or $la -match 'পদের\s+নাম\s*:'){$examStarts+=$m.Index}
}
$sorted=$examStarts|Sort-Object;$clean=@();$last=-1000
foreach($s in $sorted){if($s-$last -gt 200){$clean+=$s;$last=$s}}

$sections=@()
for($i=0;$i -lt $clean.Count;$i++){
    $s=$clean[$i];$e=if($i -lt $clean.Count-1){$clean[$i+1]}else{$content.Length}
    $txt=$content.Substring($s,$e-$s)
    $hlen=[Math]::Min(400,$txt.Length);$h=TrimStr($txt.Substring(0,$hlen)-replace"`r|`n"," ")
    $name="";$date=""
    $m1=[regex]::Match($h,'(?:মিনিট|Minutes)\s+(.+?)(?:\s+পদের নাম|\s+পূর্ণমান|\s+পরীক্ষার|\s*$)')
    if($m1.Success -and $m1.Groups[1].Value.Trim().Length -gt 3){$name=TrimStr($m1.Groups[1].Value)}
    if(-not $name){$m2=[regex]::Match($h,'(সমন্বিত\s+[\d০১২৩৪৫৬৭৮৯]+\s+ব্যাংক[^প]*?)(?:\s+পদের|\s*$)');if($m2.Success){$name=TrimStr($m2.Groups[1].Value)}}
    if($h -match 'তারিখ:\s*([\d./]+)'){$date=$matches[1]}
    $sections+=@{Index=$i;Text=$txt;Name=if($name){"$name ($date)"}else{"Section $i"}}
    $dn=if($name.Length -gt 50){$name.Substring(0,50)+"..."}else{$name}
    Write-Host "  [$i] $dn len=$($txt.Length)"
}

# Parse
$b2e=@{'ক'='A';'খ'='B';'গ'='C';'ঘ'='D'}
$bnDigit=@{'০'='0';'১'='1';'২'='2';'৩'='3';'৪'='4';'৫'='5';'৬'='6';'৭'='7';'৮'='8';'৯'='9'}
$all=@();$idxList=@()

foreach($sec in $sections){
    $txt=$sec.Text;$name=$sec.Name
    Write-Host "`n=== [$($sec.Index)] $name ==="
    
    # Collect answer positions
    $ansPos=@()
    foreach($m in [regex]::Matches($txt,'উ\.?\s*([কখগঘ])')){$ansPos+=@{p=$m.Index;l=$m.Groups[1].Value}}
    foreach($m in [regex]::Matches($txt,'Ans:\s*([ABCD])')){$ansPos+=@{p=$m.Index;l=$m.Groups[1].Value}}
    $ansPos=$ansPos|Sort-Object p
    Write-Host "  Answers: $($ansPos.Count)"
    if($ansPos.Count -lt 5){continue}
    
    $qs=@()
    for($i=0;$i -lt $ansPos.Count;$i++){
        $ans=$ansPos[$i]
        $prevEnd=if($i -gt 0){$ansPos[$i-1].p+6}else{0}
        $blockStart=[Math]::Max(0,$prevEnd)
        $blockEnd=$ans.p
        if($blockStart -ge $blockEnd -or $blockStart -ge $txt.Length){continue}
        
        $block=$txt.Substring($blockStart,$blockEnd-$blockStart)
        
        # Find last question number in block
        $qStr="";$qNum=0;$qStart=-1
        $bm=[regex]::Match($block,'[০১২৩৪৫৬৭৮৯]+\s*\.')
        if($bm.Success){$qStr=$bm.Value;$qStart=$block.LastIndexOf($bm.Value)}
        if($qStart -lt 0){
            $am=[regex]::Match($block,'\d+\s*\.')
            if($am.Success){$qStr=$am.Value;$qStart=$block.LastIndexOf($am.Value)}
        }
        if($qStart -lt 0){continue}
        
        # Parse question number
        $rawNum=($qStr -replace '\.','' -replace '\s','')
        $digits='';
        foreach($ch in $rawNum.ToCharArray()){
            if($bnDigit.ContainsKey($ch)){$digits+=$bnDigit[$ch]}else{$digits+=$ch}
        }
        [int]::TryParse($digits,[ref]$qNum)|Out-Null
        if($qNum -eq 0){continue}
        
        # Question text
        $afterQ=$qStart+$qStr.Length
        $rawQ=$txt.Substring($afterQ,$blockEnd-$afterQ)
        
        $stops=@('ক.','খ.','গ.','ঘ.','A.','B.','C.','D.')
        $firstStop=$rawQ.Length
        foreach($st in $stops){
            $si=$rawQ.IndexOf($st)
            if($si -ge 0 -and $si -lt $firstStop){$firstStop=$si}
        }
        $qText=TrimStr($rawQ.Substring(0,$firstStop))
        $qText=TrimStr($qText -replace 'পূর্ণমান:\s*\d+','')
        if(-not $qText -or $qText.Length -lt 2){continue}
        
        # Answer
        $answer=""
        if($ans.l.Length -eq 1 -and $b2e.ContainsKey($ans.l)){$answer=$b2e[$ans.l]}
        elseif($ans.l -match '^[ABCD]$'){$answer=$ans.l}
        if(-not $answer){continue}
        
        # Extract options
        $opts=[Ordered]@{}
        $optPos=@()
        foreach($ol in @('ক','খ','গ','ঘ')){
            $oi=$rawQ.IndexOf("$ol.")
            if($oi -ge 0){
                $nextAfter=$oi+("$ol.").Length
                $endPos=$rawQ.Length
                foreach($n in @('ক','খ','গ','ঘ','উ.','পৃষ্ঠা:','Ans:')){
                    if($n -eq "$ol." -or $n -eq "উ" -and $ol -ne "উ"){continue}
                    $sep=$n
                    $ni=$rawQ.IndexOf($sep,$nextAfter)
                    if($ni -ge 0 -and $ni -lt $endPos -and $ni -ne $oi){$endPos=$ni}
                }
                if($nextAfter -lt $endPos){
                    $ov=TrimStr($rawQ.Substring($nextAfter,$endPos-$nextAfter))
                    $ov=TrimStr($ov -replace 'পূর্ণমান:\s*\d+','')
                    if($ov){$optPos+=@{key=$b2e[$ol];val=$ov;pos=$oi;order=$ol}}
                }
            }
        }
        
        if($optPos.Count -eq 0){
            foreach($ol in @('A','B','C','D')){
                $oi=$rawQ.IndexOf("$ol.")
                if($oi -ge 0){
                    $nextAfter=$oi+2;$endPos=$rawQ.Length
                    $nxt=@();if($ol -eq 'A'){$nxt=@('B.','C.','D.','Ans:')}
                    elseif($ol -eq 'B'){$nxt=@('C.','D.','Ans:')}
                    elseif($ol -eq 'C'){$nxt=@('D.','Ans:')}
                    else{$nxt=@('Ans:')}
                    foreach($n in $nxt){$ni=$rawQ.IndexOf($n,$nextAfter);if($ni -ge 0 -and $ni -lt $endPos){$endPos=$ni}}
                    if($nextAfter -lt $endPos){$ov=TrimStr($rawQ.Substring($nextAfter,$endPos-$nextAfter));$ov=TrimStr($ov -replace 'পূর্ণমান:\s*\d+','');if($ov){$optPos+=@{key=$ol;val=$ov;pos=$oi;order=$ol}}}
                }
            }
        }
        
        # Detect 2-column layout
        $sortedPos=$optPos|Sort-Object pos
        $gPos=-1;$khPos=-1
        for($ci=0;$ci -lt $sortedPos.Count;$ci++){
            if($sortedPos[$ci].order -eq 'গ'){$gPos=$ci}
            if($sortedPos[$ci].order -eq 'খ'){$khPos=$ci}
        }
        $is2Col=($gPos -ge 0 -and $khPos -ge 0 -and $gPos -lt $khPos)
        
        if($is2Col -and $sortedPos.Count -gt 0){
            $keyMap=@('A','C','B','D')
            for($ci=0;$ci -lt [Math]::Min(4,$sortedPos.Count);$ci++){$opts[$keyMap[$ci]]=$sortedPos[$ci].val}
        } else {
            foreach($sp in $sortedPos){$opts[$sp.key]=$sp.val}
        }
        
        # Explanation
        $explanation=""
        $fwdLen=[Math]::Min(5000,$txt.Length-$ans.p)
        if($fwdLen -gt 0){
            $fwd=$txt.Substring($ans.p,$fwdLen)
            $expM=[regex]::Match($fwd,'(?:ব্যাখ্যা|Explanation):\s*(.+?)(?=(?:\d+\s*\.\s*[A-Z০১২৩৪৫৬৭৮৯]|পৃষ্ঠা:\s*\d|উ\.?\s*[কখগঘ]|$))')
            if($expM.Success){$explanation=TrimStr($expM.Groups[1].Value)}
        }
        
        $qs+=@{
            id=$qNum
            question=$qText
            options=$opts
            answer=$answer
            source=$name
            explanation=$explanation
        }
    }
    
    Write-Host "  Extracted $($qs.Count) questions"
    if($qs.Count -gt 0){
        $idxList+=@{examName=$name;count=$qs.Count}
        $sn=$name -replace '[^\w\s-]','' -replace '\s+','_'
        $sf=if($sn.Length -gt 80){$sn.Substring(0,80)}else{$sn}
        $of=Join-Path $OutputDir "bank_$($sec.Index)_$sf.json"
        $qs|ConvertTo-Json -Depth 10|Out-File $of -Encoding utf8
        Write-Host "  -> $of"
        $all+=$qs
    }
}

Write-Host "`n=== Done: $($all.Count) total questions ==="
Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('F1'))s"

$all|ConvertTo-Json -Depth 10|Out-File (Join-Path $OutputDir "bank_combined_new.json") -Encoding utf8
$idxList|ConvertTo-Json -Depth 3|Out-File (Join-Path $OutputDir "bank_new_index.json") -Encoding utf8