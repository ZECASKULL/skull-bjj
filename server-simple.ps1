# Servidor Web Simples para SKULL BJJ
Write-Host "Iniciando servidor..." -ForegroundColor Green

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Servidor online: http://localhost:$port" -ForegroundColor Cyan
    
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        Write-Host "Request: $url" -ForegroundColor Blue
        
        # Headers CORS
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
        
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }
        
        # Rotas API
        if ($url -eq "/api/health") {
            $data = @{
                success = $true
                message = "Server online"
                timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
            } | ConvertTo-Json
            
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($data)
            $response.ContentLength64 = $buffer.Length
            $response.ContentType = "application/json"
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        elseif ($url -eq "/api/login" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            
            $loginData = $body | ConvertFrom-Json
            $username = $loginData.username
            $password = $loginData.password
            
            if (($username -eq "admin" -and $password -eq "123456") -or 
                ($username -eq "usuario" -and $password -eq "senha")) {
                
                $user = if ($username -eq "admin") {
                    @{ id = 1; username = "admin"; role = "admin"; name = "Administrador" }
                } else {
                    @{ id = 2; username = "usuario"; role = "user"; name = "Usuario Comum" }
                }
                
                $data = @{
                    success = $true
                    user = $user
                    token = "token-simulado-$(Get-Date -Format yyyyMMddHHmmss)"
                } | ConvertTo-Json
            } else {
                $data = @{ success = $false; error = "Invalid credentials" } | ConvertTo-Json
            }
            
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($data)
            $response.ContentLength64 = $buffer.Length
            $response.ContentType = "application/json"
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        elseif ($url -eq "/api/products") {
            $data = @{
                success = $true
                products = @(
                    @{ id = 1; name = "Kimono Premium Black"; price = 599.90; color = "preto"; badge = "mais-vendido" }
                    @{ id = 2; name = "Kimono Competition White"; price = 799.90; color = "branco"; badge = "novo" }
                    @{ id = 3; name = "Kimono Training Blue"; price = 499.90; color = "azul" }
                    @{ id = 4; name = "Kimono Pro Edition"; price = 899.90; color = "preto"; badge = "limitado" }
                    @{ id = 5; name = "Kimono Lightweight"; price = 399.90; color = "azul" }
                    @{ id = 6; name = "Kimono Classic Gold"; price = 1299.90; color = "preto"; badge = "premium" }
                )
            } | ConvertTo-Json
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($data)
            $response.ContentLength64 = $buffer.Length
            $response.ContentType = "application/json"
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        else {
            # Servir arquivos estaticos
            $filePath = $null
            $contentType = "text/html"
            
            if ($url -eq "/" -or $url -eq "/index.html") {
                $filePath = "index.html"
            } elseif ($url -eq "/login.html") {
                $filePath = "login.html"
            } elseif ($url -eq "/test-login.html") {
                $filePath = "test-login.html"
            } elseif ($url -eq "/style.css") {
                $filePath = "style.css"
                $contentType = "text/css"
            } elseif ($url -eq "/auth-secure.js") {
                $filePath = "auth-secure.js"
                $contentType = "application/javascript"
            } elseif ($url -eq "/script-secure.js") {
                $filePath = "script-secure.js"
                $contentType = "application/javascript"
            }
            
            if ($filePath -and (Test-Path $filePath)) {
                $content = Get-Content $filePath -Raw
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.ContentType = $contentType
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
                $html404 = "<h1>404 - Not Found</h1><p>Page $url not found</p>"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($html404)
                $response.ContentLength64 = $buffer.Length
                $response.ContentType = "text/html"
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        }
        
        $response.Close()
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
}
