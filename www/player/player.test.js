// Mock Socket.IO
global.io = {
  connect: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
};

// Set up DOM elements before importing App
document.body.innerHTML = `
  <div id="login">
    <form action="" method="get">
      <div>
        <input type="text" placeholder="room code" name="room-code" id="room-code" />
        <input type="text" placeholder="username" name="nickname" id="nickname" />
        <input type="submit" value="Connect" />
      </div>
    </form>
  </div>
  <div id="game">
    <div id="username"></div>
    <div id="suggestions"></div>
  </div>
`;

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

    expect(global.io.connect).toHaveBeenCalled();
  });

  test("showSuggestions should render suggestions", () => {
    App.currentSong = {
      suggestions: [{ name: "Song 1" }, { name: "Song 2" }],
    };
    App.showSuggestions();

    const suggestions = document.getElementById("suggestions").innerHTML;
    expect(suggestions).toContain("Song 1");
    expect(suggestions).toContain("Song 2");
  });

  test("onRight should display checkmark", () => {
    App.onRight();

    expect(document.getElementById("suggestions").innerHTML).toContain("✅");
  });

  test("onWrong should display X mark", () => {
    App.onWrong();

    expect(document.getElementById("suggestions").innerHTML).toContain("❌");
  });
});
