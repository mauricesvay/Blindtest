var Game = require('./lib/Game');
var express = require('express');
var app = require('express').createServer()
var io = require('socket.io').listen(app);

var PORT = process.env.PORT || 8080;

app.listen(PORT);
app.configure('development', function(){
    app.use(express.static(__dirname + '/www'));
});
app.configure('production', function(){
    app.use(express.static(__dirname + '/www'));
});
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/www/index.html');
});
app.get('/spectate', function (req, res) {
    res.sendfile(__dirname + '/www/spectate.html');
});
io.configure('development', function(){
    io.set('log level', 1);
});
Game.init(io);