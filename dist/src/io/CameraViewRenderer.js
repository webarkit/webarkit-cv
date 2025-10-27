/*
 *  CameraViewRenderer.ts
 *  WebARKitCV
 *
 *  This file is part of WebARKitCV - WebARKit.
 *
 *  WebARKitCV is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WebARKitCV is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with ARnft.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  As a special exception, the copyright holders of this library give you
 *  permission to link this library with independent modules to produce an
 *  executable, regardless of the license terms of these independent modules, and to
 *  copy and distribute the resulting executable under terms of your choice,
 *  provided that you also meet, for each linked independent module, the terms and
 *  conditions of the license of that module. An independent module is a module
 *  which is neither derived from nor based on this library. If you modify this
 *  library, you may extend this exception to your version of the library, but you
 *  are not obligated to do so. If you do not wish to do so, delete this exception
 *  statement from your version.
 *
 *  Copyright 2021 WebARKit.
 *
 *  Author(s): Walter Perdan @kalwalt https://github.com/kalwalt
 *
 */
export class CameraViewRenderer {
    canvas_process;
    context_process;
    _video;
    _facing;
    vw;
    vh;
    w;
    h;
    pw;
    ph;
    ox;
    oy;
    target;
    targetFrameRate = 60;
    imageDataCache;
    cachedImageData;
    _frame;
    lastCache = 0;
    preserveImageSize = false;
    targetLongSide = 320;
    constructor(video) {
        this.canvas_process = document.createElement("canvas");
        this.context_process = this.canvas_process.getContext("2d", {
            alpha: false,
            willReadFrequently: true,
        });
        this._video = video;
        this.target = window || global;
        this._frame = 0;
        this.imageDataCache = null;
        this.cachedImageData = null;
    }
    // Getters
    get facing() {
        return this._facing;
    }
    get height() {
        return this.vh;
    }
    get width() {
        return this.vw;
    }
    get video() {
        return this._video;
    }
    get frame() {
        return this._frame;
    }
    get canvasProcess() {
        return this.canvas_process;
    }
    get contextProcess() {
        return this.context_process;
    }
    /**
     * Preserve the processing canvas size as the original video frame size when true.
     * By default the processing canvas is resized to 320px max dimension to reduce computation.
     * @param preserve use original video dimensions when preparing frames
     */
    setPreserveImageSize(preserve) {
        this.preserveImageSize = preserve;
    }
    /**
     * Set the target size (longest side) of the processing canvas when
     * preserveImageSize is false. Defaults to 320.
     */
    setTargetLongSideLength(size) {
        if (size && size > 0) {
            this.targetLongSide = size;
        }
    }
    /**
     * Set the maximum capture frequency (frames per second) when sampling the
     * video into ImageData. Lower values reduce CPU usage.
     */
    setTargetFrameRate(fps) {
        if (typeof fps === "number" && fps > 0) {
            this.targetFrameRate = fps;
        }
    }
    getFrame() {
        return this._frame;
    }
    getImage() {
        const now = Date.now();
        if (now - this.lastCache > 1000 / this.targetFrameRate) {
            this.context_process.drawImage(this.video, 0, 0, this.vw, this.vh, this.ox, this.oy, this.w, this.h);
            const captured = this.context_process.getImageData(0, 0, this.pw, this.ph);
            this.updateImageCache(captured);
            this.lastCache = now;
            this._frame++;
        }
        return this.getCachedImage();
    }
    get image() {
        const now = Date.now();
        if (now - this.lastCache > 1000 / this.targetFrameRate) {
            this.context_process.drawImage(this.video, 0, 0, this.vw, this.vh, this.ox, this.oy, this.w, this.h);
            const captured = this.context_process.getImageData(0, 0, this.pw, this.ph);
            this.updateImageCache(captured);
            this.lastCache = now;
            this._frame++;
        }
        return this.getCachedImage();
    }
    /**
     * Draw the detected corners on the processing canvas.
     * corners must be an array of 8 numbers: [x0,y0,x1,y1,x2,y2,x3,y3]
     */
    drawCorners(corners, color = "lime", lineWidth = 2) {
        if (!corners || corners.length < 8)
            return;
        const ctx = this.context_process;
        try {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(corners[0], corners[1]);
            ctx.lineTo(corners[2], corners[3]);
            ctx.lineTo(corners[4], corners[5]);
            ctx.lineTo(corners[6], corners[7]);
            ctx.closePath();
            ctx.stroke();
            // draw small circles at corners
            for (let i = 0; i < 8; i += 2) {
                const x = corners[i];
                const y = corners[i + 1];
                ctx.beginPath();
                if (typeof ctx.arc === "function") {
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                else {
                    // fallback for mocked contexts that don't implement arc
                    ctx.fillRect(x - 2, y - 2, 4, 4);
                }
            }
            ctx.restore();
        }
        catch (e) {
            // swallow errors to avoid breaking callers; drawing is optional
            // but log to console for debugging
            // eslint-disable-next-line no-console
            console.warn("drawCorners failed:", e);
        }
    }
    prepareImage() {
        this.vw = this._video.videoWidth;
        this.vh = this._video.videoHeight;
        if (this.preserveImageSize || !this.vw || !this.vh) {
            // Use original video dimensions as processing size.
            this.w = this.vw;
            this.h = this.vh;
            this.pw = this.vw;
            this.ph = this.vh;
            this.ox = 0;
            this.oy = 0;
        }
        else {
            const longSideTarget = Math.max(1, this.targetLongSide);
            const scale = longSideTarget / Math.max(this.vw, this.vh);
            const pscale = scale <= 1 ? scale : 1;
            // Void float point
            this.w = Math.floor(this.vw * pscale);
            this.h = Math.floor(this.vh * pscale);
            this.pw = Math.floor(Math.max(this.w, (this.h / 3) * 4));
            this.ph = Math.floor(Math.max(this.h, (this.w / 4) * 3));
            this.ox = Math.floor((this.pw - this.w) / 2);
            this.oy = Math.floor((this.ph - this.h) / 2);
        }
        this.canvas_process.width = this.pw;
        this.canvas_process.height = this.ph;
        this.context_process.fillStyle = "black";
        this.context_process.fillRect(0, 0, this.pw, this.ph);
        // processing dimensions changed, invalidate caches so we rebuild them lazily
        this.imageDataCache = null;
        this.cachedImageData = null;
    }
    updateImageCache(imageData) {
        const size = imageData.data.length;
        if (!this.imageDataCache || this.imageDataCache.length !== size) {
            this.imageDataCache = new Uint8ClampedArray(new ArrayBuffer(size));
            this.cachedImageData = null;
        }
        this.imageDataCache.set(imageData.data);
    }
    getCachedImage() {
        if (!this.imageDataCache) {
            const size = this.pw * this.ph * 4;
            this.imageDataCache = new Uint8ClampedArray(new ArrayBuffer(size));
            this.cachedImageData = null;
        }
        if (!this.cachedImageData ||
            this.cachedImageData.width !== this.pw ||
            this.cachedImageData.height !== this.ph) {
            this.cachedImageData = new ImageData(this.imageDataCache, this.pw, this.ph);
        }
        return this.cachedImageData;
    }
    async initialize(videoSettings) {
        this._facing = videoSettings.facingMode || "environment";
        if (videoSettings.targetFrameRate != null) {
            this.targetFrameRate = videoSettings.targetFrameRate;
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const hint = {
                    audio: false,
                    video: {
                        facingMode: this._facing,
                        width: {
                            min: videoSettings.width.min,
                            max: videoSettings.width.max,
                        },
                    },
                };
                if (navigator.mediaDevices.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = [];
                    let videoDeviceIndex = 0;
                    devices.forEach(function (device) {
                        if (device.kind == "videoinput") {
                            videoDevices[videoDeviceIndex++] = device.deviceId;
                        }
                    });
                    if (videoDevices.length > 1) {
                        hint.video.deviceId = {
                            exact: videoDevices[videoDevices.length - 1],
                        };
                    }
                }
                const stream = await navigator.mediaDevices.getUserMedia(hint);
                this._video.srcObject = stream;
                this._video = await new Promise((resolve) => {
                    this._video.onloadedmetadata = () => resolve(this._video);
                });
                this.prepareImage();
                return true;
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        else {
            return Promise.reject("Sorry, Your device does not support this experience.");
        }
    }
    destroy() {
        const video = this._video;
        this.target.addEventListener("stopVideoStreaming", function () {
            const stream = video.srcObject;
            console.log("stop streaming");
            if (stream !== null && stream !== undefined) {
                const tracks = stream.getTracks();
                tracks.forEach(function (track) {
                    track.stop();
                });
                video.srcObject = null;
                let currentAR = document.getElementById("app");
                if (currentAR !== null && currentAR !== undefined) {
                    currentAR.remove();
                }
            }
        });
    }
}
//# sourceMappingURL=CameraViewRenderer.js.map