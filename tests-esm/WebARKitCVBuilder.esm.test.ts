/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { WebARKitBase, WebARKitCVBuilder as IWebARKitCVBuilder } from '../src/interfaces/WebARKitCVBuilder';
import { ITrackable, Trackable } from '../src/interfaces/Trackables';
import { v4 as uuidv4 } from 'uuid';

const imreadMock = jest.fn((source: string | HTMLImageElement | HTMLCanvasElement) => {
  void source;
  return {
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  } as unknown as ImageData;
});

jest.unstable_mockModule('../src/io/imgFunctions', () => ({
  imread: imreadMock,
}));

const { imread } = await import('../src/io/imgFunctions');

class WebARKitCV implements IWebARKitCVBuilder {
  private webarkit: WebARKitBase;
  private version: string;
  private trackableCount = 0;

  constructor() {
    this.version = 'testing with jest!';
    console.info('WebARKitCV : ', this.version);
    this.webarkit = new WebARKitBase();
    this.clear();
    this.webarkit.trackable = new Trackable('', '', '');
    this.webarkit.trackables = new Map<number, ITrackable>();
    this.webarkit.isLoaded = false;
  }

  public setWidth(width: number): IWebARKitCVBuilder {
    this.webarkit.width = width;
    return this;
  }

  public setHeight(height: number): IWebARKitCVBuilder {
    this.webarkit.height = height;
    return this;
  }

  public addTrackable(trackableName: string, trackableUrl: string): IWebARKitCVBuilder {
    if (typeof trackableName === 'string' && typeof trackableUrl === 'string') {
      this.webarkit.trackable!.name = trackableName;
      this.webarkit.trackable!.url = trackableUrl;
      this.webarkit.trackable!.uuid = uuidv4();
      this.webarkit.trackables?.set(this.trackableCount++, this.webarkit.trackable!);
    } else {
      throw new Error('Trackable name and url must be strings');
    }

    return this;
  }

  private setIsLoaded(isLoaded: boolean): IWebARKitCVBuilder {
    this.webarkit.isLoaded = isLoaded;
    return this;
  }

  public build(): WebARKitBase {
    const webarkit = this.webarkit;
    this.setIsLoaded(true);
    this.clear();
    return webarkit;
  }

  public loadTrackables(): IWebARKitCVBuilder {
    const trackables = this.webarkit.trackables;
    trackables!.forEach((trackable) => {
      const data = imread(trackable.name);
      console.log(data);
      console.log(trackable.name);
    });
    return this;
  }

  private clear(): void {
    this.webarkit = new WebARKitBase();
  }
}

describe('WebARKitCVBuilder (ESM)', () => {
  afterEach(() => {
    imreadMock.mockClear();
  });

  test('Builder produces a configured WebARKitCV instance', () => {
    document.body.innerHTML = '<img src="pinball.jpg" id="pinball" />';

    const builder = new WebARKitCV()
      .setHeight(480)
      .setWidth(640)
      .addTrackable('pinball', './pinball.jpg')
      .loadTrackables()
      .build();

    expect(builder.height).toBe(480);
    expect(builder.width).toBe(640);
    expect(builder.trackable!.name).toBe('pinball');
    expect(builder.trackable!.url).toBe('./pinball.jpg');
    expect(imreadMock).toHaveBeenCalledWith('pinball');
  });
});
