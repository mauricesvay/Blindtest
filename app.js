const Game = require("./lib/Game");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 8080;

app.use(express.static("www"));
app.get("/", function(req, res) {
    res.sendfile("/www/index.html", { root: __dirname });
});
app.get("/spectate", function(req, res) {
    res.sendfile("/www/spectate.html", { root: __dirname });
});

Game.init(io);
server.listen(PORT);
