#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="opencv_js"
BUILD_DIR="build"

if [ ! -d "${OUTPUT_DIR}" ]; then
    mkdir -p "${OUTPUT_DIR}"
    chmod -R a+rwx "${OUTPUT_DIR}" 2>/dev/null || sudo chmod -R 777 "${OUTPUT_DIR}" > /dev/null
    echo "mkdir ${OUTPUT_DIR}"
fi

docker run --rm -v "$(pwd)":/src -u "$(id -u):$(id -g)" -e "EMSCRIPTEN=/emsdk/upstream/emscripten" emscripten/emsdk:3.1.69 emcmake python3 ./opencv/platforms/js/build_js.py "${OUTPUT_DIR}" --config="./opencv.webarkit_config.py" --build_wasm --cmake_option="-DBUILD_opencv_dnn=OFF" --cmake_option="-DBUILD_opencv_objdetect=OFF" --cmake_option="-DBUILD_opencv_photo=OFF" --cmake_option="-DCPU_BASELINE=DETECT" --cmake_option="-DCPU_DISPATCH=" --cmake_option="-DCPU_BASELINE_DISABLE=SSE;SSE2;SSE3;SSSE3;SSE4_1;SSE4_2;POPCNT;AVX;FP16;FMA3;AVX2;AVX_512F" --build_flags="-fwasm-exceptions -mbulk-memory -mnontrapping-fptoint -s WASM_BIGINT=1 -s SUPPORT_LONGJMP=wasm -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=0 -s MODULARIZE=1 -s ENVIRONMENT=web,worker"

mkdir -p "${BUILD_DIR}"
cp -f "${OUTPUT_DIR}/bin/opencv_js.js" "${BUILD_DIR}/opencv_js.js"