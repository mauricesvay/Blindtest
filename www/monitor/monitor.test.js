// Mock jQuery
global.$ = jest.fn((selector) => {
  if (selector === "#visualization") {
    return [
      {
        width: 0,
        height: 0,
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
      },
    ];
  }
  return {
    on: jest.fn(),
    hide: jest.fn(),
    html: jest.fn(),
    text: jest.fn(),
    val: jest.fn(),
    attr: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
  };
});

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
