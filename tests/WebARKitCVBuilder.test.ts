/**
 * @jest-environment jsdom
 */
import { describe, expect, jest, test } from "@jest/globals";
import { WebARKitBase } from "../src/interfaces/WebARKitCVBuilder";
import { ITrackable, Trackable } from "../src/interfaces/Trackables";
import { WebARKitCVBuilder } from "../src/interfaces/WebARKitCVBuilder";
import { imread } from "../src/io/imgFunctions";
import { v4 as uuidv4 } from "uuid";
class WebARKitCV implements WebARKitCVBuilder {
  private webarkit: WebARKitBase;
  private version: string;
  private trackableCount: number = 0;
  constructor() {
    this.version = "testing with jest!";
    console.info("WebARKitCV : ", this.version);
    this.webarkit = new WebARKitBase();
    this.clear();
    this.webarkit.trackable = new Trackable("", "", "");
    this.webarkit.trackables = new Map<number, ITrackable>();
    this.webarkit.isLoaded = false;
  }
  public setWidth(width: number): WebARKitCVBuilder {
    this.webarkit.width = width;
    return this;
  }
  public setHeight(height: number): WebARKitCVBuilder {
    this.webarkit.height = height;
    return this;
  }

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
      console.log(data);
      console.log(trackable.name);
      // No worker stuff for testing...
      //this.trackableWorkers.push(
      //new WebARKitCVOrbWorker(trackables!, data!.width, data!.height, data)
      // );
      //this.trackableWorkers![index].initialize();
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

jest.mock("../src/io/imgFunctions");

describe("Init WebARKitCV and test the properties, this is a fake WebARKItCV, to test code without the Worker.", () => {
  test("Init the WebARKItCV constructor, and pass all the methods.", () => {
    document.body.innerHTML = '<img src="pinball.jpg" id="pinball" />';

    const wb = new WebARKitCV()
      .setHeight(480)
      .setWidth(640)
      .addTrackable("pinball", "./pinball.jpg")
      .loadTrackables()
      .build();

    expect(wb.height).toBe(480);
    expect(wb.width).toBe(640);
    expect(wb!.trackable!.name).toBe("pinball");
    expect(wb!.trackable!.url).toBe("./pinball.jpg");
  });
});
