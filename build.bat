@echo off
echo ====================================================
echo        Prem Jodo - Server Build Generation
echo ====================================================
echo.

echo [1/2] Generating Production Export for Server Upload...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please check error messages above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ====================================================
echo [SUCCESS] Server Build Ready in 'out' folder!
echo ====================================================
echo.
echo Aapko 'out' folder ke andar ke saare files aur folders
echo apne server ke public_html / web root directory me upload karne hain.
echo.
pause
