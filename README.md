# webarkit-cv

A set of tools to build a custom and light opencv lib to be used in WebAR projects. This is a WIP, but at this moment it can import opencv_js.js as a **ES6** module.

## OpenCV and emsdk
We are using OpenCV version 4.1.6 and emsdk 3.1.26

### Tools

See the build.sh script. It will build the opencv_js.js lib and after it will copy in the build folder. We are trying to build a lighter opencv_js.js lib, 
So we use a config to minimize the file size. Without this the final lib will be too big in size with features that we don't need.
The opencv_js.js file is based on a modified version of OpenCV that let you import the OpenCV library as a ES6 module. If you are interested read this [issue](https://github.com/kalwalt/webarkit-cv/issues/1).
