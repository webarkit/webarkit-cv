import { ITrackable } from "./Trackables";

export class WebARKitBase {
  constructor(
    public width?: number,
    public height?: number,
    public trackable?: ITrackable,
    public trackables?: Map<number, ITrackable>,
    public isLoaded?: boolean,
    public opencv?: any
  ) { }
}

export interface WebARKitCVBuilder {
  setWidth(width: number): WebARKitCVBuilder;
  setHeight(height: number): WebARKitCVBuilder;
  addTrackable(trackableName: string, trackableUrl: string): WebARKitCVBuilder;
  loadTrackables(): WebARKitCVBuilder;
  build(): WebARKitBase;
} 