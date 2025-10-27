/**
 * @class Tracker
 * @description The Tracker class is used to create a Tracker object. The class implements the {@link ITracker} interface.
 * @property {string} name - The name of the tracker.
 * @property {Float32Array} matrix - The matrix of the tracker.
 * @property {string} uuid - The uuid of the tracker.
 */
export class Tracker {
    name;
    matrix;
    uuid;
    constructor(name, matrix, uuid) {
        this.name = name;
        this.matrix = matrix;
        this.uuid = uuid;
    }
}
//# sourceMappingURL=Trackers.js.map