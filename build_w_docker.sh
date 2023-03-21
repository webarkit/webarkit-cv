#!/usr/bin/env bash

# adding the -e "EMSCRIPTEN=/emsdk/upstream/emscripten" partially fixes the issue, but the build still fails...
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) -e "EMSCRIPTEN=/emsdk/upstream/emscripten"  emscripten/emsdk:3.1.26 emcmake python3 ./opencv/platforms/js/build_js.py build_js 