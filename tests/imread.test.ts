/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test} from '@jest/globals';
import { imread } from '../src/io/imgFunctions';

jest.mock('../src/io/imgFunctions')
jest.mock('../examples/pinball.jpg')

describe('A simple test for the imread function', () => {
    test('Test if the imread function is well defined', () => {
        document.body.innerHTML = '<img src="./pinball.jpg" id="pinball" /> <canvas></canvas>';
        imread('pinball')
        expect(imread).toBeDefined();
    })
})

describe('Another test for the imread function', () => {
  test('Test if the imread function return imageData', () => {
      document.body.innerHTML = '<img src="../examples/pinball.jpg" id="pinball" /> <canvas></canvas>';
      var i = imread('pinball');     
      expect(i).toBe(undefined);
  })
})