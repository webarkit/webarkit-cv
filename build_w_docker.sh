#!/usr/bin/env bash

docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:3.1.26 emcmake python3 ./opencv/platforms/js/build_js.py build_js