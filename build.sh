#!/usr/bin/env bash

# remember to 'export EMSCRIPTEN="/path/to/emsdk/upstream/emscripten"' before running this script !

python3 ./opencv/platforms/js/build_js.py opencv_js --config="./opencv.webarkit_config.py" --build_wasm --cmake_option="-DBUILD_opencv_dnn=OFF"  --cmake_option="-DBUILD_opencv_objdetect=OFF" --cmake_option="-DBUILD_opencv_photo=OFF"

cp -r opencv_js/bin/opencv_js.js build
cp -r opencv_js/bin/opencv.js build
