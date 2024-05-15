/**
 * @interface ITracker
 * @description The ITracker interface is used to create a Tracker object with the {@link Tracker} class.
 * @property {string} name - The name of the tracker.
 * @property {Float32Array} matrix - The matrix of the tracker.
 * @property {string} uuid - The uuid of the tracker.
 */
export interface ITracker {
  name: string;
  matrix: Float32Array;
  uuid: string;
}

/**
 * @class Tracker
 * @description The Tracker class is used to create a Tracker object. The class implements the {@link ITracker} interface.
 * @property {string} name - The name of the tracker.
 * @property {Float32Array} matrix - The matrix of the tracker.
 * @property {string} uuid - The uuid of the tracker.
 */
export class Tracker implements ITracker {
  constructor(
    public name: string,
    public matrix: Float32Array,
    public uuid: string
  ) {}
}
