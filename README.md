![github releases](https://flat.badgen.net/github/release/webarkit/webarkit-cv)
![github stars](https://flat.badgen.net/github/stars/webarkit/webarkit-cv)
![github forks](https://flat.badgen.net/github/forks/webarkit/webarkit-cv)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build WebARKitCV](https://github.com/webarkit/webarkit-cv/actions/workflows/build_opencv.yml/badge.svg)](https://github.com/webarkit/webarkit-cv/actions/workflows/build_opencv.yml)

# webarkit-cv

A set of tools to build a custom and light opencv lib to be used in WebAR projects. This is a WIP, but at this moment opencv_js.js can be imported as a **ES6** module.
The main goal of this project is to develop a WebAR library that can be used to build a Web AR application, based on the OpenCV library.

## OpenCV and emsdk
We are using OpenCV version 4.6.0 and emsdk 2.0.10

### Tools

See the build.sh script. It will build the opencv_js.js lib and after it will copy in the build folder. We are trying to build a lighter opencv_js.js lib, 
So we use a config to minimize the file size. Without this the final lib will be too big in size with features that we don't need.
The opencv_js.js file is based on a modified version of OpenCV that let you import the OpenCV library as a ES6 module. If you are interested read this [issue](https://github.com/kalwalt/webarkit-cv/issues/1).

### Future development

- Typescript support
- npm package
- documentation
- first WebAR example