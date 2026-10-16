@echo off
set CC=gcc
where gcc >nul 2>&1 || if exist C:\msys64\mingw64\bin set PATH=C:\msys64\mingw64\bin;%%PATH%%
if not exist build mkdir build
echo [ARES] Compiling...
%CC% -std=c11 -Wall -Wextra -Wno-unused-parameter -Iinclude -g -DDEBUG src\main.c src\emergency\emergency.c src\resource\resource.c src\routing\graph.c src\storage\persistence.c src\structures\priority_queue.c src\simulation\simulation.c src\ui\map.c src\ui\ui.c src\ui\utils.c -lm -o build\ares.exe
if %ERRORLEVEL% EQU 0 (
    echo [ARES] SUCCESS: created build\ares.exe
    echo [ARES] Run with: build\ares.exe
) else (
    echo [ARES] FAILED.
)
