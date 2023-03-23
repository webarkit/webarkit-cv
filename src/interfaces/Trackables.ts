export interface ITrackable {
    url: string;
    name: string;
    uuid: string;
}
export class Trackable implements ITrackable {
    constructor(
        public url: string,
        public name: string,
        public uuid: string
    ) {}
}