@echo off
setlocal EnableExtensions

rem Media Vault - arranque rapido para Windows
rem Estrutura assumida:
rem   Backend:  D:\pocketbase
rem   Frontend: pasta onde este ficheiro .bat estiver guardado

set "BACKEND_DIR=D:\pocketbase"
set "FRONTEND_DIR=%~dp0"
set "PB_EXE=%BACKEND_DIR%\pocketbase.exe"
set "PACKAGE_JSON=%FRONTEND_DIR%package.json"
set "PB_URL=http://127.0.0.1:8090"
set "FRONTEND_URL=http://127.0.0.1:5173"

cd /d "%FRONTEND_DIR%"

echo.
echo =====================================================
echo              MEDIA VAULT - ARRANQUE LOCAL
echo =====================================================
echo Backend : %BACKEND_DIR%
echo Frontend: %FRONTEND_DIR%
echo.

if not exist "%PB_EXE%" (
  echo [ERRO] PocketBase nao encontrado:
  echo        %PB_EXE%
  echo.
  pause
  exit /b 1
)

if not exist "%PACKAGE_JSON%" (
  echo [ERRO] package.json nao encontrado na pasta do BAT:
  echo        %PACKAGE_JSON%
  echo.
  echo Guarda este ficheiro em D:\media-vault-vue\
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao foi encontrado no PATH.
  echo Instala uma versao Node.js LTS compativel e volta a executar.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao foi encontrado no PATH.
  pause
  exit /b 1
)

rem Verificar se o PocketBase ja responde.
powershell.exe -NoProfile -Command "try { $null=Invoke-RestMethod '%PB_URL%/api/health' -TimeoutSec 2; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo [INFO] A iniciar PocketBase em %PB_URL% ...
  start "Media Vault - PocketBase" /D "%BACKEND_DIR%" "%PB_EXE%" serve --http=127.0.0.1:8090

  echo [INFO] A aguardar pelo backend...
  powershell.exe -NoProfile -Command "$ok=$false; foreach($i in 1..30){ try { $null=Invoke-RestMethod '%PB_URL%/api/health' -TimeoutSec 2; $ok=$true; break } catch { Start-Sleep -Seconds 1 } }; if($ok){exit 0}else{exit 1}"
  if errorlevel 1 (
    echo [ERRO] PocketBase nao respondeu ao fim de 30 segundos.
    echo Consulta a janela "Media Vault - PocketBase".
    pause
    exit /b 1
  )
) else (
  echo [OK] PocketBase ja esta ativo.
)

echo [OK] PocketBase disponivel.

if not exist "%FRONTEND_DIR%node_modules\" (
  echo [INFO] node_modules nao existe. A executar npm install...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERRO] npm install falhou.
    pause
    exit /b 1
  )
)

rem Nao iniciar outra instancia Vite se a porta 5173 ja estiver ativa.
powershell.exe -NoProfile -Command "try { $null=Invoke-WebRequest '%FRONTEND_URL%' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo [INFO] A iniciar Vite em %FRONTEND_URL% ...
  start "Media Vault - Vue" /D "%FRONTEND_DIR%" cmd.exe /k npm.cmd run dev

  echo [INFO] A aguardar pelo frontend...
  powershell.exe -NoProfile -Command "$ok=$false; foreach($i in 1..30){ try { $r=Invoke-WebRequest '%FRONTEND_URL%' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){$ok=$true; break} } catch { Start-Sleep -Seconds 1 } }; if($ok){exit 0}else{exit 1}"
  if errorlevel 1 (
    echo [AVISO] O frontend ainda nao respondeu.
    echo Consulta a janela "Media Vault - Vue".
    pause
    exit /b 1
  )
) else (
  echo [OK] Vite ja esta ativo.
)

echo [OK] Frontend disponivel.
echo.
echo Aplicacao : %FRONTEND_URL%
echo PocketBase: %PB_URL%
echo Dashboard : %PB_URL%/_/
echo.

start "" "%FRONTEND_URL%"
exit /b 0
