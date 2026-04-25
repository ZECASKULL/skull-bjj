# Servidor HTTP para Jiujitsu Store
$port = 8000
$root = Get-Location

Write-Host "Iniciando servidor Jiujitsu Store..."
Write-Host "URL: http://localhost:$port"

# Tentar iniciar servidor Python
try {
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", "cd '$root'; python -m http.server $port" -WindowStyle Hidden
    Start-Sleep 2
    Start-Process "http://localhost:$port"
    Write-Host "Servidor iniciado com sucesso!"
}
catch {
    Write-Host "Erro ao iniciar servidor. Verifique se Python esta instalado."
}
