# Servidor HTTP Simples para Jiujitsu Store
import-module webadministration

# Criar e iniciar o servidor
$port = 8000
$root = Get-Location

Write-Host "🚀 Iniciando Jiujitsu Store Server..." -ForegroundColor Green
Write-Host "📍 Diretório: $root" -ForegroundColor Yellow
Write-Host "🌐 URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host "🛑 Pressione Ctrl+C para parar" -ForegroundColor Red
Write-Host ""

# Iniciar servidor Python se disponível
try {
    python --version | Out-Null
    Write-Host "🐍 Usando Python HTTP Server..." -ForegroundColor Blue
    python -m http.server $port
}
catch {
    Write-Host "❌ Python não encontrado. Tentando alternativa..." -ForegroundColor Red
    
    # Tentar com Node.js se disponível
    try {
        node --version | Out-Null
        Write-Host "📦 Usando Node.js HTTP Server..." -ForegroundColor Blue
        npx http-server -p $port -c-1
    }
    catch {
        Write-Host "❌ Node.js não encontrado. Criando servidor PowerShell..." -ForegroundColor Red
        
        # Servidor HTTP nativo do PowerShell
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
        
        Write-Host "✅ Servidor PowerShell iniciado com sucesso!" -ForegroundColor Green
        Start-Process "http://localhost:$port"
        
        try {
            while ($true) {
                $context = $listener.GetContext()
                $request = $context.Request
                $response = $context.Response
                
                $url = $request.Url.LocalPath
                $filePath = Join-Path $root ($url -replace '^/', '')
                
                if (-not (Test-Path $filePath)) {
                    $filePath = Join-Path $root "index.html"
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
            Write-Host "👋 Servidor encerrado" -ForegroundColor Yellow
        }
    }
}
