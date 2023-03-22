import cv from '../build/opencv_js'

export class WebARKitCV {
   constructor() {
      console.log('WebARKitCV');
   }
   async init(): Promise<any> {
      const opencv: any = await cv();
      console.log(opencv);
      return opencv;
   }
}