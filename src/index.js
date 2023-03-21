import cv from '../build/opencv_js.js'

export class WebARKit {
   constructor() {
      console.log('WebARKit');
   }
   async init() {
      const opencv = await cv();
      console.log(opencv);
      return opencv;
   }
}