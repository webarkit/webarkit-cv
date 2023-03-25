import { describe, expect, jest, test } from "@jest/globals";
import { ITrackable, Trackable } from "../src/interfaces/Trackables";
import { v4 as uuidv4 } from "uuid";

describe("A simple test for the Trackable class", () => {
  test("Test if the Trackable class is well defined", () => {
    expect(Trackable).toBeDefined();
  });
});

describe("Another test for the Trackable class", () => {
  test("Test if the Trackable class return a new Trackable", () => {
    const uuid: string = uuidv4();
    const t: ITrackable = new Trackable("pinball.jpg", "pinball", uuid);

    expect(t.name).toBe("pinball");
    expect(t.url).toBe("pinball.jpg");
    expect(t.uuid).toBe(uuid);
  });
});
