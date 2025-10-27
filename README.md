![github releases](https://flat.badgen.net/github/release/webarkit/webarkit-cv)
![github stars](https://flat.badgen.net/github/stars/webarkit/webarkit-cv)
![github forks](https://flat.badgen.net/github/forks/webarkit/webarkit-cv)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CI WebARKitCV](https://github.com/webarkit/webarkit-cv/actions/workflows/CI.yml/badge.svg)](https://github.com/webarkit/webarkit-cv/actions/workflows/CI.yml)
[![Build WebARKitCV](https://github.com/webarkit/webarkit-cv/actions/workflows/build_opencv.yml/badge.svg)](https://github.com/webarkit/webarkit-cv/actions/workflows/build_opencv.yml)

# webarkit-cv

WebARKitCV is an opinionated toolchain for producing lightweight OpenCV builds tailored to WebAR workloads. It bundles the scripts, configuration, and TypeScript helpers we use to compile our fork of OpenCV into a single-file ES module (`opencv_js.js`) that runs in modern browsers and Web Workers.

The project currently targets OpenCV **4.12.0** (forked under `webarkit/opencv`) and **emsdk 3.1.69**. Expect breaking changes while we continue to tune the build for smaller payloads and a smoother developer experience; treat the artifacts as experimental until we cut a stable release.

Getting started is as simple as cloning the repo, running one of the build scripts (`build.sh` on Unix, `build_w_docker.bat` on Windows), and loading the generated example pages under `examples/` to validate your environment. Feedback and contributions are welcome—see the Issues section for discussion topics and the roadmap.

## Typescript

WebARKitCV is developed in the Typescript language; Type definitions are in the `types` folder.

## OpenCV and Emscripten emsdk

We are using OpenCV version 4.12.0 (our modified fork) and emsdk 3.1.69

### Tools

See the build scripts below; each one compiles the OpenCV ES module and copies it into the `build` folder. We are trying to build a lighter `opencv_js.js`, so we use a custom config to trim features we do not currently need. The module is based on our forked OpenCV tree, which adds ES module support—details live in [issue #1](https://github.com/kalwalt/webarkit-cv/issues/1).

### Build scripts

- `build.sh`: native Linux workflow that assumes `emsdk`/Emscripten is installed and on your `PATH`.
- `build_w_docker.sh`: Linux/macOS workflow that wraps the build in the official Emscripten Docker image—no local `emsdk` install required.
- `build_w_docker.bat`: Windows PowerShell/Command Prompt variant that uses the same Docker-based flow.

### Future development

- npm package
- documentation
- first WebAR example
