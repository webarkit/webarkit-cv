# webarkit-cv

A set of tools to build a ccustom and light opencv lib to be used in WebAR projects. 

## OpenCV and emsdk
We are using OpenCV version 4.1.6 and emsdk 3.1.26

### Tools

See the build.sh script. It will build the opencv.js lib and after it will copy in the build folder. We are trying to build a lighter opencv.js lib, 
so we use a config to minimize the file size. Without this the final lib will be too big in size with features that we don't need.
