# ==============================================
# SERVIDOR WEB USANDO POWERSHELL
# ==============================================
# Servidor HTTP simples para executar o site

Write-Host "🚀 Iniciando servidor web..." -ForegroundColor Green

# Verificar se a porta está disponível
$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "✅ Servidor iniciado com sucesso!" -ForegroundColor Green
    Write-Host "📍 URL: http://localhost:$port" -ForegroundColor Cyan
    Write-Host "🛡️ Backend: Simulado (modo desenvolvimento)" -ForegroundColor Yellow
    Write-Host "📋 Para parar: Pressione Ctrl+C" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
    
    # Criar API simulada para login
    $apiRoutes = @{
        "/api/health" = @{
            success = $true
            message = "Servidor Jiujitsu Store online (PowerShell)"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
            version = "1.0.0-PowerShell"
        }
        "/api/login" = @{
            success = $true
            user = @{
                id = 1
                username = "admin"
                role = "admin"
                name = "Administrador"
                email = "admin@skullbjj.com"
            }
            token = "jwt-token-simulado-powershell-$(Get-Date -Format yyyyMMddHHmmss)"
        }
        "/api/products" = @{
            success = $true
            products = @(
                @{
                    id = 1
                    name = "Kimono Premium Black"
                    price = 599.90
                    color = "preto"
                    image = "https://via.placeholder.com/300x400/000000/FFFFFF?text=Kimono+Black"
                    description = "Kimono profissional de alta qualidade"
                    badge = "mais-vendido"
                }
                @{
                    id = 2
                    name = "Kimono Competition White"
                    price = 799.90
                    color = "branco"
                    image = "https://via.placeholder.com/300x400/FFFFFF/000000?text=Kimono+White"
                    description = "Kimono para competições"
                    badge = "novo"
                }
                @{
                    id = 3
                    name = "Kimono Training Blue"
                    price = 499.90
                    color = "azul"
                    image = "https://via.placeholder.com/300x400/0000FF/FFFFFF?text=Kimono+Blue"
                    description = "Kimono para treinamento diário"
                }
                @{
                    id = 4
                    name = "Kimono Pro Edition"
                    price = 899.90
                    color = "preto"
                    image = "https://via.placeholder.com/300x400/333333/FFFFFF?text=Kimono+Pro"
                    description = "Edição limitada para profissionais"
                    badge = "limitado"
                }
                @{
                    id = 5
                    name = "Kimono Lightweight"
                    price = 399.90
                    color = "azul"
                    image = "https://via.placeholder.com/300x400/1E90FF/FFFFFF?text=Kimono+Light"
                    description = "Kimono ultra leve para verão"
                }
                @{
                    id = 6
                    name = "Kimono Classic Gold"
                    price = 1299.90
                    color = "preto"
                    image = "https://via.placeholder.com/300x400/FFD700/000000?text=Kimono+Gold"
                    description = "Edição especial com detalhes em ouro"
                    badge = "premium"
                }
            )
            total = 6
        }
    }
    
    Write-Host "🔧 Rotas API disponíveis:" -ForegroundColor Cyan
    foreach ($route in $apiRoutes.Keys) {
        Write-Host "   GET  $route" -ForegroundColor Gray
    }
    Write-Host "   POST /api/login" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    
    # Loop principal do servidor
    while ($true) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $url = $request.Url.LocalPath
            $method = $request.HttpMethod
            
            Write-Host "📡 [$method] $url" -ForegroundColor Blue
            
            # Configurar headers CORS
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
            
            # Tratar OPTIONS (CORS preflight)
            if ($method -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }
            
            # Servir arquivos estáticos
            if ($url -eq "/" -or $url -eq "/index.html") {
                $filePath = Join-Path $PSScriptRoot "index.html"
                $contentType = "text/html"
            } elseif ($url -eq "/login.html") {
                $filePath = Join-Path $PSScriptRoot "login.html"
                $contentType = "text/html"
            } elseif ($url -eq "/test-login.html") {
                $filePath = Join-Path $PSScriptRoot "test-login.html"
                $contentType = "text/html"
            } elseif ($url -eq "/style.css") {
                $filePath = Join-Path $PSScriptRoot "style.css"
                $contentType = "text/css"
            } elseif ($url -eq "/auth-secure.js") {
                $filePath = Join-Path $PSScriptRoot "auth-secure.js"
                $contentType = "application/javascript"
            } elseif ($url -eq "/script-secure.js") {
                $filePath = Join-Path $PSScriptRoot "script-secure.js"
                $contentType = "application/javascript"
            } elseif ($apiRoutes.ContainsKey($url)) {
                # Servir API
                $responseData = $apiRoutes[$url]
                $jsonResponse = $responseData | ConvertTo-Json -Depth 10
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
                $response.ContentLength64 = $buffer.Length
                $response.ContentType = "application/json"
                $response.StatusCode = 200
                
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            } elseif ($url -eq "/api/login" -and $method -eq "POST") {
                # Processar login POST
                try {
                    $reader = New-Object System.IO.StreamReader($request.InputStream)
                    $body = $reader.ReadToEnd()
                    $reader.Close()
                    
                    Write-Host "📝 Login request: $body" -ForegroundColor Yellow
                    
                    # Simular validação de login
                    $loginData = $body | ConvertFrom-Json
                    $username = $loginData.username
                    $password = $loginData.password
                    
                    if (($username -eq "admin" -and $password -eq "123456") -or 
                        ($username -eq "usuario" -and $password -eq "senha")) {
                        
                        $user = if ($username -eq "admin") {
                            @{
                                id = 1
                                username = "admin"
                                role = "admin"
                                name = "Administrador"
                                email = "admin@skullbjj.com"
                            }
                        } else {
                            @{
                                id = 2
                                username = "usuario"
                                role = "user"
                                name = "Usuário Comum"
                                email = "usuario@skullbjj.com"
                            }
                        }
                        
                        $responseData = @{
                            success = $true
                            message = "Login realizado com sucesso"
                            user = $user
                            token = "jwt-token-simulado-$(Get-Date -Format yyyyMMddHHmmss)"
                        }
                        
                        Write-Host "✅ Login successful for $username" -ForegroundColor Green
                    } else {
                        $responseData = @{
                            success = $false
                            error = "Usuário ou senha inválidos"
                        }
                        
                        Write-Host "❌ Login failed for $username" -ForegroundColor Red
                    }
                    
                    $jsonResponse = $responseData | ConvertTo-Json -Depth 10
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
                    
                    $response.ContentLength64 = $buffer.Length
                    $response.ContentType = "application/json"
                    $response.StatusCode = 200
                    
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $response.Close()
                    continue
                    
                } catch {
                    Write-Host "❌ Error processing login: $_" -ForegroundColor Red
                    
                    $errorResponse = @{
                        success = $false
                        error = "Erro ao processar login"
                    } | ConvertTo-Json
                    
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorResponse)
                    $response.ContentLength64 = $buffer.Length
                    $response.ContentType = "application/json"
                    $response.StatusCode = 400
                    
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $response.Close()
                    continue
                }
            } else {
                # Arquivo não encontrado
                $response.StatusCode = 404
                $response.ContentType = "text/html"
                $errorHtml = @"
<!DOCTYPE html>
<html>
<head><title>404 - Página não encontrada</title></head>
<body>
    <h1>404 - Página não encontrada</h1>
    <p>A página $url não foi encontrada.</p>
    <a href="/">Voltar para página inicial</a>
</body>
</html>
"@
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorHtml)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }
            
            # Servir arquivo estático
            if (Test-Path $filePath) {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                
                $response.ContentLength64 = $buffer.Length
                $response.ContentType = $contentType
                $response.StatusCode = 200
                
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
            }
            
            $response.Close()
            
        } catch {
            Write-Host "❌ Erro no servidor: $_" -ForegroundColor Red
            continue
        }
    }
    
} catch {
    Write-Host "❌ Erro ao iniciar servidor: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    Write-Host "🛑 Servidor parado." -ForegroundColor Yellow
}
