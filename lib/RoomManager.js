var Room = require("./Room");

/**
 * RoomManager - Manages all active rooms for the game server
 */
var RoomManager = {
  io: null,
  rooms: {},
  IDLE_ROOM_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  init: function (io) {
    this.io = io;
    console.log("RoomManager initialized");
    this.waitForConnections();
    this.startIdleRoomCleanup();
  },

  startIdleRoomCleanup: function () {
    // Periodically check for idle rooms (no users and old)
    setInterval(
      () => {
        var now = Date.now();
        var roomsToDelete = [];

        for (var roomCode in RoomManager.rooms) {
          var room = RoomManager.rooms[roomCode];
          // If room has no users and hasn't been accessed recently, mark for deletion
          if (
            room.getUserCount() === 0 &&
            now - (room.createdAt || now) > RoomManager.IDLE_ROOM_TIMEOUT
          ) {
            roomsToDelete.push(roomCode);
          }
        }

        roomsToDelete.forEach(function (roomCode) {
          console.log(
            `[${roomCode}] Idle room cleaned up (no activity for ${
              RoomManager.IDLE_ROOM_TIMEOUT / 1000 / 60
            } minutes)`
          );
          RoomManager.removeRoom(roomCode);
        });
      },
      5 * 60 * 1000
    ); // Check every 5 minutes
  },

  waitForConnections: function () {
    RoomManager.io.sockets.on("connection", function (socket) {
      console.log("New connection: " + socket.id);

      // User wants to create a new room
      socket.on("createRoom", function (data) {
        var roomCode = RoomManager.generateRoomCode();
        RoomManager.createRoom(roomCode, socket);
      });

      // User wants to join an existing room
      socket.on("joinRoom", function (data) {
        if (!data.roomCode) {
          socket.emit("joinRoomFailed", { reason: "Missing room code" });
          return;
        }
        RoomManager.joinRoom(data.roomCode.toUpperCase(), socket);
      });
    });
  },

  generateRoomCode: function () {
    // Generate a random 4-letter room code
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var code = "";
    for (var i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check if code already exists, regenerate if needed
    if (RoomManager.rooms[code]) {
      return RoomManager.generateRoomCode();
    }
    return code;
  },

  createRoom: function (roomCode, socket) {
    var room = new Room(roomCode, RoomManager.io);
    RoomManager.rooms[roomCode] = room;
    console.log(`Created room: ${roomCode}`);
    socket.emit("roomCreated", { roomCode: roomCode });
    RoomManager.joinRoom(roomCode, socket);
  },

  joinRoom: function (roomCode, socket) {
    var room = RoomManager.rooms[roomCode];
    if (!room) {
      socket.emit("joinRoomFailed", { reason: "Room not found" });
      return;
    }

    // Join the socket to the room namespace
    socket.join(`room:${roomCode}`);

    // Create a User for this socket and add to the room
    var User = require("./User");
    var user = new User(room, socket);
    if (!room.addUser(user)) {
      socket.emit("joinRoomFailed", { reason: "Room is full" });
      socket.leave(`room:${roomCode}`);
      return;
    }

    socket.emit("joinedRoom", { roomCode: roomCode });
    room.broadcastRoomStatus();
  },

  getRoom: function (roomCode) {
    return RoomManager.rooms[roomCode.toUpperCase()];
  },

  removeRoom: function (roomCode) {
    roomCode = roomCode.toUpperCase();
    delete RoomManager.rooms[roomCode];
    console.log(`Removed room: ${roomCode}`);
  },

  getRooms: function () {
    return RoomManager.rooms;
  },
};

module.exports = RoomManager;
