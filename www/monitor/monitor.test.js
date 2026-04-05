// Mock soundManager
global.soundManager = {
  usePeakData: true,
  destroySound: jest.fn(),
  createSound: jest.fn(() => ({
    play: jest.fn(),
    stop: jest.fn(),
    onPosition: jest.fn(),
  })),
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ url: "http://localhost:8080" }),
  })
);

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  beginPath: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  closePath: jest.fn(),
}));

// Set up DOM elements before importing App
document.body.innerHTML = `
  <div id="players"></div>
  <div id="intro">
    <h2>Join the game</h2>
    <h1><span id="join-url"></span></h1>
    <span id="start">START</span>
  </div>
  <div id="game">
    <div id="player">
      <canvas id="visualization"></canvas>
      <span id="timer"></span>
    </div>
    <ul id="suggestions"></ul>
    <div id="layer">
      <div id="hint"></div>
      <div id="answer">
        <div id="player-right"><span></span> guessed</div>
        <div class="artist"></div>
        <div class="title"></div>
      </div>
      <div id="winner">
        <span id="winner-name"></span> is the winner!
        <div class="artist"></div>
        <div class="title"></div>
      </div>
    </div>
  </div>
`;

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

  test("init should set up visualization", () => {
    App.init();

    expect(App.visualization.ctx).toBeTruthy();
  });

  test("showSuggestions should render list items", () => {
    App.currentSong = {
      suggestions: [
        { name: "Song 1", answer: true },
        { name: "Song 2", answer: false },
      ],
    };
    App.showSuggestions();

    const suggestionsHTML = document.getElementById("suggestions").innerHTML;
    expect(suggestionsHTML).toContain("Song 1");
    expect(suggestionsHTML).toContain("Song 2");
  });

  test("visualization should have update method", () => {
    expect(typeof App.visualization.update).toBe("function");
  });
});
