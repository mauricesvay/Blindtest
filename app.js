const RoomManager = require("./lib/RoomManager");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 8080;

app.use(express.static("www"));
app.get("/", function (req, res) {
  res.redirect("/player/index.html");
});
app.get("/spectate", function (req, res) {
  res.redirect("/monitor/index.html");
});

RoomManager.init(io);
server.listen(PORT);
console.log(`Monitor: http://localhost:${PORT}/monitor`);
