// Mock jQuery/Zepto
global.$ = jest.fn((selector) => ({
  on: jest.fn(),
  hide: jest.fn(),
  html: jest.fn(),
  text: jest.fn(),
  val: jest.fn(),
  attr: jest.fn(),
  addClass: jest.fn(),
  removeClass: jest.fn(),
}));

// Mock Socket.IO
global.io = {
  connect: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
};

// Mock location
global.location = {
  hostname: "localhost",
  port: "8080",
};

// Mock window
global.window = {
  location: global.location,
};

const App = require("./player.js");

describe("Player App", () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    global.io.connect.mockReturnValue(mockSocket);

    App.currentSong = null;
    App.username = null;
  });

  test("App should have init method", () => {
    expect(typeof App.init).toBe("function");
  });

  test("init should connect to socket", () => {
    App.init();

    expect(global.io.connect).toHaveBeenCalledWith("http://localhost:8080");
  });
});
