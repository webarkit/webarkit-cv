import * as cv from '../build/opencv.js'

export async function init() {
   window.cv = await cv;
   console.log(window.cv);
   //var mat = cv.Mat()
   //console.log(mat);
}


//init()
