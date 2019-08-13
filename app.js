var Game = require("./lib/Game");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var PORT = process.env.PORT || 8080;

// app.configure("development", function() {
app.use(express.static(__dirname + "/www"));
// });
// app.configure("production", function() {
//   app.use(express.static(__dirname + "/www"));
// });
app.get("/", function(req, res) {
  res.sendfile("/www/index.html", { root: __dirname });
});
app.get("/spectate", function(req, res) {
  res.sendfile("/www/spectate.html", { root: __dirname });
});
// io.configure("development", function() {
//   io.set("log level", 1);
// });
// io.configure(function() {
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);
// });

app.listen(PORT);
Game.init(io);
