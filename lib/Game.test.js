const Game = require("./Game");

// Mock the dependencies
jest.mock("../lib/User");
jest.mock("../lib/Songs");

describe("Game", () => {
  let mockIo;

  beforeEach(() => {
    // Reset Game state
    Game.users = [];
    Game.round = null;
    Game.currentSong = null;

    // Mock io
    mockIo = {
      sockets: {
        on: jest.fn(),
        in: jest.fn(() => ({
          emit: jest.fn(),
        })),
      },
    };
  });

  describe("init", () => {
    test("should initialize the game with io and call waitForUsers", () => {
      Game.init(mockIo);

      expect(Game.io).toBe(mockIo);
      expect(mockIo.sockets.on).toHaveBeenCalledWith(
        "connection",
        expect.any(Function)
      );
    });
  });

  describe("addUser", () => {
    test("should add user to users array if under max users", () => {
      const mockUser = { id: 1 };

      Game.addUser(mockUser);

      expect(Game.users).toContain(mockUser);
      expect(Game.users.length).toBe(1);
    });

    test("should refuse user if at max users", () => {
      // Fill up to max users
      for (let i = 0; i < Game.MAX_USERS; i++) {
        Game.users.push({ id: i });
      }

      const mockUser = { id: "max", refuse: jest.fn() };

      Game.addUser(mockUser);

      expect(mockUser.refuse).toHaveBeenCalled();
      expect(Game.users.length).toBe(Game.MAX_USERS);
    });
  });

  describe("removeUser", () => {
    test("should remove user from users array", () => {
      const mockUser = { id: 1 };
      Game.users = [mockUser];

      Game.removeUser(mockUser);

      expect(Game.users).not.toContain(mockUser);
      expect(Game.users.length).toBe(0);
    });
  });
});
