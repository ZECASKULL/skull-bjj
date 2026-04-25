@echo off
echo Iniciando servidor Jiujitsu Store...
cd /d "%~dp0"
echo Servidor rodando em: http://localhost:8000
echo Pressione Ctrl+C para parar
echo.
start http://localhost:8000
python -m http.server 8000
pause
