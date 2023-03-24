/**
 * @interface ITrackable
 * @description The ITrackable interface is used to create a Trackable object with the {@link Trackable} class.
 * @property {string} url - The url of the image.
 * @property {string} name - The name of the trackable.
 * @property {string} uuid - The uuid of the trackable.
 */
export interface ITrackable {
  url: string;
  name: string;
  uuid: string;
}

/**
 * @class Trackable
 * @description The Trackable class is used to create a Trackable object.
 * The class implements the {@link ITrackable} interface.
 * @property {string} url - The url of the image.
 * @property {string} name - The name of the trackable.
 * @property {string} uuid - The uuid of the trackable.
 */
export class Trackable implements ITrackable {
  constructor(public url: string, public name: string, public uuid: string) {}
}
