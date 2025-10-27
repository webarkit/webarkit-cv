import { describe, expect, test } from '@jest/globals';
import { ITracker, Tracker } from '../src/interfaces/Trackers';
import { v4 as uuidv4 } from 'uuid';

// Ensures the Tracker class integrates with the real uuid package under ESM Jest.
describe('Tracker (ESM)', () => {
  test('Tracker class is defined', () => {
    expect(Tracker).toBeDefined();
  });

  test('Tracker stores the provided uuid', () => {
    const uuid: string = uuidv4();
  const matrix: Float32Array = new Float32Array(12);
    const tracker: ITracker = new Tracker('pinball', matrix, uuid);

    expect(tracker.name).toBe('pinball');
    expect(tracker.uuid).toBe(uuid);
  });
});
