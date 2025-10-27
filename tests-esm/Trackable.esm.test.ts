import { describe, expect, test } from '@jest/globals';
import { ITrackable, Trackable } from '../src/interfaces/Trackables';
import { v4 as uuidv4 } from 'uuid';

// Mirrors Trackable tests without relying on Jest moduleNameMapper for uuid.
describe('Trackable (ESM)', () => {
  test('Trackable class is defined', () => {
    expect(Trackable).toBeDefined();
  });

  test('Trackable constructor persists the provided uuid', () => {
    const uuid: string = uuidv4();
    const trackable: ITrackable = new Trackable('pinball.jpg', 'pinball', uuid);

    expect(trackable.name).toBe('pinball');
    expect(trackable.url).toBe('pinball.jpg');
    expect(trackable.uuid).toBe(uuid);
  });
});
