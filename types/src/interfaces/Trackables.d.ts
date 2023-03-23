export interface ITrackable {
    url: string;
    name: string;
    uuid: string;
}
export declare class Trackable implements ITrackable {
    url: string;
    name: string;
    uuid: string;
    constructor(url: string, name: string, uuid: string);
}
