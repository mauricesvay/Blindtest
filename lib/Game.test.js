const Game = require("./Game");

// Mock the dependencies
jest.mock("../lib/Songs");

describe("Game", () => {
  let game;
  let mockRoom;
  let mockIo;

  beforeEach(() => {
    // Mock room
    mockRoom = {
      getRoomCode: jest.fn(() => "TEST"),
      getUsers: jest.fn(() => []),
      removeUser: jest.fn(),
    };

    // Mock io
    mockIo = {
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
    };

    // Create a new Game instance for each test
    game = new Game(mockRoom, mockIo);
  });

  describe("constructor", () => {
    test("should initialize the game with room and io", () => {
      expect(game.room).toBe(mockRoom);
      expect(game.io).toBe(mockIo);
      expect(game.MAX_USERS).toBe(16);
      expect(game.MAX_SCORE).toBe(10);
      expect(game.round).toBeNull();
      expect(game.currentSong).toBeNull();
      expect(game.currentSongErrors).toBe(0);
    });
  });

  describe("getRoomSocketName", () => {
    test("should return the correct room socket name", () => {
      const roomName = game.getRoomSocketName();
      expect(roomName).toBe("room:TEST");
      expect(mockRoom.getRoomCode).toHaveBeenCalled();
    });
  });

  describe("removeUser", () => {
    test("should remove user from room", () => {
      const mockUser = { id: 1 };

      game.removeUser(mockUser);

      expect(mockRoom.removeUser).toHaveBeenCalledWith(mockUser);
    });
  });
});
