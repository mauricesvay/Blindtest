// Mock document methods for testing
const mockElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  style: {},
  textContent: "",
  innerHTML: "",
  getContext: jest.fn(() => ({
    clearRect: jest.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    beginPath: jest.fn(),
    arc: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    closePath: jest.fn(),
  })),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
};

global.document = {
  getElementById: jest.fn(() => mockElement),
  querySelector: jest.fn(() => mockElement),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
};

// Mock soundManager
global.soundManager = {
  usePeakData: true,
};

// Mock window
global.window = {
  location: "http://localhost:8080/spectate",
};

const App = require("./monitor.js");

describe("Monitor App", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    App.currentSong = null;
    App.audio = null;
    App.timestamp = 0;
  });

  test("App should have init method", () => {
    expect(typeof App.init).toBe("function");
  });

  test("init should set join url", () => {
    App.init();

    expect(global.$).toHaveBeenCalledWith("#join-url");
  });
});
