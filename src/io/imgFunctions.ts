/**
 * Read image data from image source. ImageSource can be a canvas or an image id.
 * @param {any} imageSource
 * @returns {ImageData} ImageData
 */
export function imread(imageSource: string | HTMLImageElement | HTMLCanvasElement): ImageData | null {
  let img: any;
  if (typeof imageSource === "string") {
    img = document.getElementById(imageSource);
  } else {
    img = imageSource;
  }
  let canvas = null;
  let ctx = null;
  let width, height;
  if (img instanceof HTMLImageElement) {
    canvas = document.createElement("canvas");
    width = img.width;
    height = img.height;
    if (width <= 0 || height <= 0) {
      console.error("Invalid image dimensions.");
      return null;
    }
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx!.drawImage(img, 0, 0, width, height);
  } else if (img instanceof HTMLCanvasElement) {
    canvas = img;
    width = canvas.width;
    height = canvas.height;
    if (width <= 0 || height <= 0) {
      console.error("Invalid canvas dimensions.");
      return null;
    }
    ctx = canvas.getContext("2d");
  } else {
    console.error("Please input the valid canvas or img id.");
    return null;
  }
  if (!ctx) {
    console.error("Error getting 2D rendering context.");
    return null;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) {
    console.error("Invalid ImageData.");
    return null;
  }
  return imageData;
}
