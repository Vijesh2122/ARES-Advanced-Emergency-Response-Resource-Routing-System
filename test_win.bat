@echo off
set CC=gcc
where gcc >nul 2>&1 || if exist C:\msys64\mingw64\bin set PATH=C:\msys64\mingw64\bin;%%PATH%%
if not exist build mkdir build
echo.
echo [TEST] Emergency module...
%CC% -std=c11 -Wall -Wextra -Wno-unused-parameter -Iinclude -g tests\test_emergency.c src\emergency\emergency.c src\ui\utils.c -lm -o build\test_emergency.exe
if %ERRORLEVEL% EQU 0 ( build\test_emergency.exe ) else ( echo FAILED emergency tests )
echo.
echo [TEST] Resource module...
%CC% -std=c11 -Wall -Wextra -Wno-unused-parameter -Iinclude -g tests\test_resource.c src\resource\resource.c src\ui\utils.c -lm -o build\test_resource.exe
if %ERRORLEVEL% EQU 0 ( build\test_resource.exe ) else ( echo FAILED resource tests )
echo.
echo [TEST] Advanced algorithm module...
%CC% -std=c11 -Wall -Wextra -Wno-unused-parameter -Iinclude -g tests\test_advanced.c src\emergency\emergency.c src\resource\resource.c src\routing\graph.c src\structures\priority_queue.c src\storage\persistence.c src\simulation\simulation.c src\ui\map.c src\ui\ui.c src\ui\utils.c -lm -o build\test_advanced.exe
if %ERRORLEVEL% EQU 0 ( build\test_advanced.exe ) else ( echo FAILED advanced algorithm tests )
echo.
echo All tests complete.
