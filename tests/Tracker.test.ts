import { describe, expect, jest, test } from "@jest/globals";
import { ITracker, Tracker } from "../src/interfaces/Trackers";
import { v4 as uuidv4 } from "uuid";

describe("A simple test for the Tracker class", () => {
  test("Test if the Tracker class is well defined", () => {
    expect(Tracker).toBeDefined();
  });
});

describe("Another test for the Tracker class", () => {
  test("Test if the Tracker class return a new Tracker", () => {
    const uuid: string = uuidv4();
    const matrix: Float32Array = new Float32Array(12);
    const t: ITracker = new Tracker("pinball", matrix, uuid);

    expect(t.name).toBe("pinball");
    expect(t.matrix).toBe(matrix);
    expect(t.uuid).toBe(uuid);
  });
});
