const User = require('./User');

// Mock the he module
jest.mock('he', () => ({
  encode: jest.fn((str) => str)
}));

describe('User', () => {
  let mockGame;
  let mockSocket;

  beforeEach(() => {
    mockGame = {
      updatePlayers: jest.fn(),
      removeUser: jest.fn(),
      newRound: jest.fn(),
      nextSong: jest.fn()
    };

    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      join: jest.fn()
    };
  });

  test('should initialize user with game and socket', () => {
    const user = new User(mockGame, mockSocket);

    expect(user.game).toBe(mockGame);
    expect(user.socket).toBe(mockSocket);
    expect(user.username).toBe('');
    expect(user.score).toBe(0);
    expect(user.locked).toBe(true);
    expect(user.hasJoined).toBe(false);
  });

  test('should bind events on initialization', () => {
    const user = new User(mockGame, mockSocket);

    expect(mockSocket.on).toHaveBeenCalledWith('login', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('spectate', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('next', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('button', expect.any(Function));
  });

  test('should handle login event', () => {
    const user = new User(mockGame, mockSocket);
    const loginCallback = mockSocket.on.mock.calls.find(call => call[0] === 'login')[1];

    loginCallback({ username: 'testuser' });

    expect(user.username).toBe('testuser');
    expect(mockSocket.emit).toHaveBeenCalledWith('login');
    expect(mockGame.updatePlayers).toHaveBeenCalled();
  });

  test('should handle disconnect event', () => {
    const user = new User(mockGame, mockSocket);
    const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

    disconnectCallback();

    expect(mockGame.removeUser).toHaveBeenCalledWith(user);
  });

  test('should handle spectate event', () => {
    const user = new User(mockGame, mockSocket);
    const spectateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'spectate')[1];

    spectateCallback();

    expect(mockSocket.join).toHaveBeenCalledWith('game');
    expect(mockGame.updatePlayers).toHaveBeenCalled();
  });

  test('should handle start event', () => {
    const user = new User(mockGame, mockSocket);
    const startCallback = mockSocket.on.mock.calls.find(call => call[0] === 'start')[1];

    startCallback();

    expect(mockGame.newRound).toHaveBeenCalled();
  });

  test('should handle next event', () => {
    const user = new User(mockGame, mockSocket);
    const nextCallback = mockSocket.on.mock.calls.find(call => call[0] === 'next')[1];

    nextCallback();

    expect(mockGame.nextSong).toHaveBeenCalled();
  });
});