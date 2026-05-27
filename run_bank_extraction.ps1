[CmdletBinding()]
param(
    [string] $ContentDir = "C:\Users\User\OneDrive\Documents\contents",
    [string] $OutputDir = "public/bank",
    [int] $MaxParallel = 3
)

$jobs = @(
    @{File="Combined Bank QB [ exambd.net ].pdf";        Exam="combined_bank"}
    @{File="Islami Bank Question Bank exambd.net.pdf";   Exam="islami_bank"}
    @{File="Grameen Bank Question Bank www.exambd.net.pdf"; Exam="grameen_bank"}
    @{File="DSS Question Bank with Explain [ exambd.net ].pdf"; Exam="dss"}
)

$scriptPath = Join-Path $PSScriptRoot "extract_bank_pdf.ps1"

function Start-Extraction {
    param($j)
    $pdfPath = Join-Path $ContentDir $j.File
    if (-not (Test-Path $pdfPath)) {
        Write-Host "NOT FOUND: $($j.File)" -ForegroundColor Red
        return
    }
    Write-Host "Starting: $($j.Exam) ..." -ForegroundColor Cyan
    & $scriptPath -PdfPath $pdfPath -ExamName $j.Exam -OutputDir $OutputDir -StartPage 30
}

foreach ($j in $jobs) {
    Start-Extraction $j
}

Write-Host "`nAll done!" -ForegroundColor Green
