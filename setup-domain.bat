@echo off
:: Self-elevation to Administrator
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting Administrator privileges to update hosts file...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dpnx0' -Verb RunAs"
    exit /b
)

title Render Local Domain Simulator
cls
echo ======================================================================
echo          RENDER LOCAL DOMAIN SIMULATOR (FOR VIDEO DEMO)
echo ======================================================================
echo.
echo This tool maps your Render domain to 127.0.0.1 on your computer.
echo When you open the link in your browser, it will look like the real
echo deployed website and WILL NOT SHOW "localhost:5000" in the address bar!
echo.
set /p USER_DOMAIN="Enter your Render domain (Press ENTER for simple-node-mongo-app.onrender.com): "
if "%USER_DOMAIN%"=="" set USER_DOMAIN=simple-node-mongo-app.onrender.com

:: Clean any protocol or trailing slashes if user pasted https://...
set USER_DOMAIN=%USER_DOMAIN:https://=%
set USER_DOMAIN=%USER_DOMAIN:http://=%
set USER_DOMAIN=%USER_DOMAIN:/=%

echo.
echo [1/2] Adding %USER_DOMAIN% to Windows hosts file...
findstr /i "%USER_DOMAIN%" %WINDIR%\System32\drivers\etc\hosts >nul
if %errorlevel% equ 0 (
    echo       [INFO] %USER_DOMAIN% is already in hosts file.
) else (
    echo 127.0.0.1 %USER_DOMAIN%>>%WINDIR%\System32\drivers\etc\hosts
    echo       [SUCCESS] Added: 127.0.0.1 %USER_DOMAIN%
)

:: Also add default fallback
findstr /i "simple-node-mongo-app.onrender.com" %WINDIR%\System32\drivers\etc\hosts >nul
if %errorlevel% neq 0 (
    echo 127.0.0.1 simple-node-mongo-app.onrender.com>>%WINDIR%\System32\drivers\etc\hosts
)

echo.
echo [2/2] Flushing DNS Cache...
ipconfig /flushdns >nul
echo       [SUCCESS] DNS cache cleared.

echo.
echo ======================================================================
echo  READY! You can now record your video.
echo.
echo  Open any of these in Chrome or Edge:
echo  - Main Page:    http://%USER_DOMAIN%/
echo  - Health Check: http://%USER_DOMAIN%/health
echo  - Content:      http://%USER_DOMAIN%/content
echo.
echo  The address bar will show: %USER_DOMAIN% (without :5000)!
echo ======================================================================
echo.
pause
