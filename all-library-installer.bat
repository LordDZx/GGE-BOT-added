@echo off
title LordDZx Library installer all in one

echo ====== install all in one ======
npm install && npx playwright install-deps && npx playwright install

echo.
echo ====== Finished ======
pause
