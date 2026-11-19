@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Mediario - arranque local rapido
rem Este ficheiro deve ficar dentro da pasta do frontend, junto ao package.json.
rem Procura o pocketbase.exe primeiro na pasta acima e depois em D:\pocketbase.

set "FRONTEND_DIR=%~dp0"
for %%I in ("%FRONTEND_DIR%..") do set "PARENT_DIR=%%~fI"

set "BACKEND_DIR=%PARENT_DIR%"
if not exist "%BACKEND_DIR%\pocketbase.exe" set "BACKEND_DIR=D:\pocketbase"

set "PB_EXE=%BACKEND_DIR%\pocketbase.exe"
set "PACKAGE_JSON=%FRONTEND_DIR%package.json"
set "PB_URL=http://127.0.0.1:8090"
set "FRONTEND_URL=http://127.0.0.1:5173"

cd /d "%FRONTEND_DIR%"

echo.
echo =====================================================
echo              MEDIARIO - ARRANQUE LOCAL
echo =====================================================
echo Backend : %BACKEND_DIR%
echo Frontend: %FRONTEND_DIR%
echo.

if not exist "%PB_EXE%" (
  echo [ERRO] pocketbase.exe nao encontrado.
  echo Procurado em:
  echo   %PARENT_DIR%\pocketbase.exe
  echo   D:\pocketbase\pocketbase.exe
  echo.
  pause
  exit /b 1
)

if not exist "%PACKAGE_JSON%" (
  echo [ERRO] package.json nao encontrado junto ao BAT:
  echo   %PACKAGE_JSON%
  echo.
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao foi encontrado no PATH.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao foi encontrado no PATH.
  pause
  exit /b 1
)

where curl.exe >nul 2>nul
if errorlevel 1 (
  echo [ERRO] curl.exe nao foi encontrado no Windows.
  pause
  exit /b 1
)

rem Verificar se o backend ja responde.
curl.exe -fsS --max-time 2 "%PB_URL%/api/health" >nul 2>nul
if errorlevel 1 (
  echo [INFO] A iniciar PocketBase em %PB_URL% ...
  start "Mediario - PocketBase" /D "%BACKEND_DIR%" "%PB_EXE%" serve --http=127.0.0.1:8090

  echo [INFO] A aguardar pelo backend...
  set "PB_READY=0"
  for /L %%N in (1,1,30) do (
    if "!PB_READY!"=="0" (
      curl.exe -fsS --max-time 2 "%PB_URL%/api/health" >nul 2>nul
      if not errorlevel 1 (
        set "PB_READY=1"
      ) else (
        timeout /t 1 /nobreak >nul
      )
    )
  )

  if "!PB_READY!"=="0" (
    echo [ERRO] PocketBase nao respondeu ao fim de 30 segundos.
    echo Consulta a janela "Mediario - PocketBase".
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

rem Verificar se o Vite ja responde.
curl.exe -fsS --max-time 2 "%FRONTEND_URL%" >nul 2>nul
if errorlevel 1 (
  echo [INFO] A iniciar Vite em %FRONTEND_URL% ...
  start "Mediario - Vue" /D "%FRONTEND_DIR%" cmd.exe /k npm.cmd run dev

  echo [INFO] A aguardar pelo frontend...
  set "VITE_READY=0"
  for /L %%N in (1,1,30) do (
    if "!VITE_READY!"=="0" (
      curl.exe -fsS --max-time 2 "%FRONTEND_URL%" >nul 2>nul
      if not errorlevel 1 (
        set "VITE_READY=1"
      ) else (
        timeout /t 1 /nobreak >nul
      )
    )
  )

  if "!VITE_READY!"=="0" (
    echo [ERRO] O frontend nao respondeu ao fim de 30 segundos.
    echo Consulta a janela "Mediario - Vue".
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
