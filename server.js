var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//var Launcher = require('./launcher');
var Launcher = require('./spark-launcher');



app.use(express.static('www'));

server.listen(8082);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var launcher;

io.sockets.on('connection', function (socket) {
  socket.emit('hello');

  socket.on('start', function(data) {

    if(!launcher) {
      launcher = new Launcher(data);
    }

    launcher.on('launcher-ready', function(data) {
      socket.emit('ready', data);
    });

    launcher.on('launcher-data', function(data) {
      socket.emit('data', data);
    });
  });
});


