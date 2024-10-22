/**
 * @class Trackable
 * @description The Trackable class is used to create a Trackable object.
 * The class implements the {@link ITrackable} interface.
 * @property {string} url - The url of the image.
 * @property {string} name - The name of the trackable.
 * @property {string} uuid - The uuid of the trackable.
 */
export class Trackable {
    url;
    name;
    uuid;
    constructor(url, name, uuid) {
        this.url = url;
        this.name = name;
        this.uuid = uuid;
    }
}
//# sourceMappingURL=Trackables.js.map