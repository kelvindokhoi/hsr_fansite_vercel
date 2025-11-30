@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo Clean Tree Structure
echo ====================
echo.

call :ShowTree "." " "

goto :eof

:ShowTree
set "CUR_DIR=%~1"
set "INDENT=%~2"

REM Skip excluded directories
set "SKIP=0"
for %%E in (node_modules .git .vscode .cache dist build coverage logs temp tmp __pycache__) do (
    if /i "%~nx1"=="%%E" set "SKIP=1"
)

if %SKIP%==1 goto :eof

REM Show directory
if "%CUR_DIR%"=="." (
    echo %INDENT%[ROOT]
) else (
    echo %INDENT%+-- %~nx1\
)

REM Show subdirectories
for /f "delims=" %%D in ('dir "%CUR_DIR%" /ad /b /on 2^>nul') do (
    call :ShowTree "%CUR_DIR%\%%D" "%INDENT%    "
)

REM Show files
for /f "delims=" %%F in ('dir "%CUR_DIR%" /a-d /b /on 2^>nul') do (
    echo %INDENT%    +-- %%F
)

goto :eof