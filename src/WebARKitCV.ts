import { WebARKitCVBuilder } from "./interfaces/WebARKitCVBuilder";
import { WebARKitBase } from "./interfaces/WebARKitCVBuilder";
import { ITrackable, Trackable } from "./interfaces/Trackables";
import { WebARKitCVOrbWorker } from "./Workers/WebARKitCVWorkers";
import { imread } from "./io/imgFunctions";
import { v4 as uuidv4 } from "uuid";
import packageJson from "../package.json";
const { version } = packageJson;

export class WebARKitCV implements WebARKitCVBuilder {
  private webarkit: WebARKitBase;
  private version: string;
  private trackableCount: number = 0;
  private trackableWorkers: WebARKitCVOrbWorker[] = [];
  /**
   * WebARKitCV constructor it implements the WebARKitCVBuilder interface.
   * The class implements the Builder pattern to create a WebARKitCV object.
   * Example:
   * ```js
   * import { WebARKitCV } from '@webarkit/webarkit-cv';
   *
   *      const webarkit = new WebARKitCV();
   *      webarkit.setWidth(640)
   *      .setHeight(480)
   *      .addTrackable("pinball", "./pinball.jpg")
   *      .loadTrackables()
   *      const track = webarkit.build();
   * ```
   * @constructor WebARKitCV
   * @param {WebARKitBase} webarkit
   * @param {string} version
   *
   */
  constructor() {
    this.version = version;
    console.info("WebARKitCV ", this.version);
    this.webarkit = new WebARKitBase();
    this.clear();
    this.webarkit.trackable = new Trackable("", "", "");
    this.webarkit.trackables = new Map<number, ITrackable>();
    this.webarkit.isLoaded = false;
  }

  /**
   * You can set the width of the video/image element as source of the tracking.
   * @param {number} width
   * @returns {WebARKitCVBuilder}
   */
  public setWidth(width: number): WebARKitCVBuilder {
    this.webarkit.width = width;
    return this;
  }

  /**
   * You can set the height of the video/image element as source of the tracking.
   * @param  {number} height
   * @returns {WebARKitCVBuilder}
   */
  public setHeight(height: number): WebARKitCVBuilder {
    this.webarkit.height = height;
    return this;
  }

  /**
   * Add a trackable to the trackables list. Every trackabe must have a name and a url.
   * The name is used to identify the trackable and the url is the path of the image.
   * Internally the class uses the uuid library to generate a unique id for each trackable.
   * @param  {string} trackableName
   * @param  {string} trackableUrl
   * @returns {WebARKitCVBuilder}
   */
  public addTrackable(
    trackableName: string,
    trackableUrl: string
  ): WebARKitCVBuilder {
    if (typeof trackableName === "string" && typeof trackableUrl === "string") {
      this.webarkit!.trackable!.name = trackableName;
      this.webarkit!.trackable!.url = trackableUrl;
      this.webarkit!.trackable!.uuid = uuidv4();
      this.webarkit!.trackables?.set(
        this.trackableCount++,
        this.webarkit!.trackable!
      );
    } else {
      throw new Error("Trackable name and url must be strings");
    }
    return this;
  }

  /**
   * Used internally to set the isLoaded property of the WebARKitCV object.
   * @param {boolean} isLoaded
   * @returns {WebARKitCVBuilder}
   */
  private setIsLoaded(isLoaded: boolean): WebARKitCVBuilder {
    this.webarkit.isLoaded = isLoaded;
    return this;
  }

  /**
   * Build the WebARKitCV object. This is the last method to call in the chain.
   * See {@link WebARKitCV.constructor} WebARKitCV for an example.
   * @returns {WebARKitBase}
   */
  public build(): WebARKitBase {
    const webarkit = this.webarkit;
    this.setIsLoaded(true);
    this.clear();
    return webarkit;
  }

  /**
   * Initialize the trackables. This method initialize the workers and load the images.
   * @returns {WebARKitCVBuilder}
   */
  public loadTrackables(): WebARKitCVBuilder {
    const trackables = this.webarkit.trackables;
    trackables!.forEach((trackable, index: number) => {
      var data = imread(trackable.name);
      this.trackableWorkers.push(
        new WebARKitCVOrbWorker(trackables!, data!.width, data!.height, data)
      );
      this.trackableWorkers![index].initialize();
    });
    return this;
  }

  /**
   * Clear the WebARKitCV object. Used internally.
   */
  private clear(): void {
    this.webarkit = new WebARKitBase();
  }
}
