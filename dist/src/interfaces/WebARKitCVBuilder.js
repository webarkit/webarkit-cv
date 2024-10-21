export class WebARKitBase {
  width;
  height;
  trackable;
  trackables;
  trackers;
  isLoaded;
  /**
   * The WebARKitBase class is the base class for the WebARKitCV class.
   * This class is used to create a WebARKitCV object with the Builder pattern.
   * @param {number} width
   * @param {number} height
   * @param {ITrackable} trackable
   * @param {Map<number, ITrackable>} trackables
   * @param {Map<number, ITracker>} trackers
   * @param {boolean} isLoaded
   */
  constructor(width, height, trackable, trackables, trackers, isLoaded) {
    this.width = width;
    this.height = height;
    this.trackable = trackable;
    this.trackables = trackables;
    this.trackers = trackers;
    this.isLoaded = isLoaded;
  }
}
//# sourceMappingURL=WebARKitCVBuilder.js.map
