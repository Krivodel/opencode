@echo off
setlocal

set OPENCODE_CHANNEL=latest
set OPENCODE_VERSION=1.2.27

echo === [1/5] Install dependencies ===
cd /d "%~dp0"
call bun install
if errorlevel 1 goto error

echo === [2/5] Build CLI ===
cd packages\opencode
call bun run script\build.ts --single
if errorlevel 1 goto error
cd ..\..

echo === [3/6] Copy CLI in sidecar ===
if not exist packages\desktop\src-tauri\sidecars mkdir packages\desktop\src-tauri\sidecars
copy /Y packages\opencode\dist\opencode-windows-x64\bin\opencode.exe packages\desktop\src-tauri\sidecars\opencode-cli-x86_64-pc-windows-msvc.exe
if errorlevel 1 goto error

echo === [5/6] Build Tauri UI ===
cd packages\desktop
call bun run tauri build --config src-tauri/tauri.prod.conf.json
if errorlevel 1 goto error
cd ..\..

echo === [6/6] Done! ===
echo Installer in:
echo packages\desktop\src-tauri\target\release\bundle\nsis\
goto end

:error
echo.
echo === ERROR ===
exit /b 1

:end
pause