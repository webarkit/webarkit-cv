const { CameraViewRenderer } = require('../src/io/CameraViewRenderer');

describe('CameraViewRenderer.drawCorners', () => {
  test('should not throw and call drawing methods on context', () => {
    const video = document.createElement('video');
    const renderer = new CameraViewRenderer(video);

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      arc: jest.fn(),
      strokeStyle: undefined,
      fillStyle: undefined,
      lineWidth: undefined,
    };

    renderer.context_process = mockCtx; // intentionally replace private for test

    const corners = [10, 10, 100, 10, 100, 80, 10, 80];

    expect(() => renderer.drawCorners(corners)).not.toThrow();

    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 10);
    expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 10);
    expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 80);
    expect(mockCtx.lineTo).toHaveBeenCalledWith(10, 80);
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
  });

  test('should return early on null or short array', () => {
    const video = document.createElement('video');
    const renderer = new CameraViewRenderer(video);

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
    };
    renderer.context_process = mockCtx;

    expect(() => renderer.drawCorners(null)).not.toThrow();
    expect(mockCtx.beginPath).not.toHaveBeenCalled();

    expect(() => renderer.drawCorners([1, 2, 3])).not.toThrow();
    expect(mockCtx.beginPath).not.toHaveBeenCalled();
  });
});
