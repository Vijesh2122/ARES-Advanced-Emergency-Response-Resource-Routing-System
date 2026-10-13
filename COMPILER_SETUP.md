# Compiler Setup for ARES (Windows - MinGW-w64)

## Fastest Method: winget (Windows Package Manager)

Open PowerShell as Administrator and run:

    winget install -e --id MSYS2.MSYS2

After installation, open the MSYS2 MinGW64 terminal and run:

    pacman -Syu
    pacman -S mingw-w64-x86_64-gcc make

Then add GCC to your Windows PATH:
1. Open System Properties > Environment Variables
2. Under System variables, edit Path
3. Add: C:\msys64\mingw64\bin
4. Click OK and restart your terminal

Verify:

    gcc --version
    make --version

## Alternative: Direct MinGW-w64 Installer

1. Download from: https://github.com/niXman/mingw-builds-binaries/releases
   - Pick: x86_64-...-release-posix-seh-ucrt-rt_v12-rev0.7z
2. Extract to C:\mingw64\
3. Add C:\mingw64\bin to PATH

Once verified, the ARES Phase 1 build will work immediately.
