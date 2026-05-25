$port = 3000
$root = "$PSScriptRoot\dist"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Serving at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    $path = $path -replace '^/80-20-exam', ''
    if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }

    $relative = $path.TrimStart('/')
    $filePath = [System.IO.Path]::Combine($root, $relative)
    $filePath = [System.IO.Path]::GetFullPath($filePath)

    if ($filePath.StartsWith($root) -and (Test-Path $filePath -PathType Leaf)) {
        $ext = [System.IO.Path]::GetExtension($filePath)
        $mime = @{
            ".html" = "text/html"
            ".js"   = "application/javascript"
            ".css"  = "text/css"
            ".png"  = "image/png"
            ".jpg"  = "image/jpeg"
            ".jpeg" = "image/jpeg"
            ".gif"  = "image/gif"
            ".svg"  = "image/svg+xml"
            ".ico"  = "image/x-icon"
            ".json" = "application/json"
            ".woff" = "font/woff"
            ".woff2" = "font/woff2"
        }[$ext]
        if (-not $mime) { $mime = "application/octet-stream" }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $mime
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $err = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($err, 0, $err.Length)
    }
    $response.OutputStream.Close()
}
$listener.Stop()
