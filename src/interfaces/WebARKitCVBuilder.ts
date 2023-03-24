import { ITrackable } from "./Trackables";

export class WebARKitBase {
  /**
   * The WebARKitBase class is the base class for the WebARKitCV class. 
   * This class is used to create a WebARKitCV object with the Builder pattern. 
   * @param {number} width 
   * @param {number} height 
   * @param {ITrackable} trackable 
   * @param {Map<number, ITrackable>} trackables 
   * @param {boolean} isLoaded 
   */
  constructor(
    public width?: number,
    public height?: number,
    public trackable?: ITrackable,
    public trackables?: Map<number, ITrackable>,
    public isLoaded?: boolean,
  ) { }
}

/**
 * @description
 * The WebARKitCVBuilder interface is used to create a WebARKitCV object with the Builder pattern.
 */
export interface WebARKitCVBuilder {
  setWidth(width: number): WebARKitCVBuilder;
  setHeight(height: number): WebARKitCVBuilder;
  addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
  loadTrackables(): WebARKitCVBuilder;
  build(): WebARKitBase;
} 