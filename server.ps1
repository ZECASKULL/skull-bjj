# Simple HTTP Server for Jiujitsu Store
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()

Write-Host "🚀 Jiujitsu Store Server iniciado em http://localhost:8000"
Write-Host "Pressione Ctrl+C para parar o servidor"

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        $filePath = Join-Path $PSScriptRoot ($url -replace '^/', '')
        
        if (-not (Test-Path $filePath)) {
            $filePath = Join-Path $PSScriptRoot "index.html"
        }
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "👋 Servidor encerrado"
}
