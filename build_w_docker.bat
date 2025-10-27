@echo off
setlocal enabledelayedexpansion

set "OUTPUT_DIR=opencv_js"
set "BUILD_DIR=build"

if not exist "%OUTPUT_DIR%" (
    mkdir "%OUTPUT_DIR%"
    rem Grant broad access so Docker can write build artifacts when using Windows file permissions
    icacls "%OUTPUT_DIR%" /grant *S-1-1-0:^(OI^)(CI^)F >nul 2>&1
    echo mkdir opencv_js
)

set "UID="
set "GID="
set "DOCKER_USER="
for /f "usebackq tokens=* delims=" %%i in (`wsl id -u 2^>nul`) do set "UID=%%i"
for /f "usebackq tokens=* delims=" %%i in (`wsl id -g 2^>nul`) do set "GID=%%i"
if defined UID if defined GID (
    set "DOCKER_USER=-u %UID%:%GID%"
)

docker run --rm -v "%cd%:/src" %DOCKER_USER% -e "EMSCRIPTEN=/emsdk/upstream/emscripten" emscripten/emsdk:3.1.69 emcmake python3 ./opencv/platforms/js/build_js.py %OUTPUT_DIR% --config="./opencv.webarkit_config.py" --build_wasm --cmake_option="-DBUILD_opencv_dnn=OFF" --cmake_option="-DBUILD_opencv_objdetect=OFF" --cmake_option="-DBUILD_opencv_photo=OFF" --cmake_option="-DCPU_BASELINE=DETECT" --cmake_option="-DCPU_DISPATCH=" --cmake_option="-DCPU_BASELINE_DISABLE=SSE;SSE2;SSE3;SSSE3;SSE4_1;SSE4_2;POPCNT;AVX;FP16;FMA3;AVX2;AVX_512F" --build_flags="-fwasm-exceptions -mbulk-memory -mnontrapping-fptoint -s WASM_BIGINT=1 -s SUPPORT_LONGJMP=wasm -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=0 -s MODULARIZE=1 -s ENVIRONMENT=web,worker"
if errorlevel 1 (
    echo Docker build failed.
    exit /b 1
)

if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%"
)

copy /Y "%OUTPUT_DIR%\bin\opencv_js.js" "%BUILD_DIR%\opencv_js.js" >nul
if errorlevel 1 (
    echo Failed to copy opencv_js.js to %BUILD_DIR%.
    exit /b 1
)

echo Build completed successfully.
endlocal
