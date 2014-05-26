// use express and listen for new websocket connections
// turn off the websocket debug messages
var express = require('express');
var app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server, {log:false});

var program = require('commander');
program
    .version('0.0.1')
    .option('-t, --token <token>', 'Spark Token')
    .option('-d, --deviceId <deviceId>', 'Spark Device ID')
    .parse(process.argv);

// include the launcher
var Launcher = require('./launcher');

// serve up static files
app.use(express.static('www'));

// listen on port 8082
server.listen(8082);

// server index.html by default
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// create the launcher instance
var myLauncher = new Launcher({
    pressureSensorPin: "A2",
    fillValvePin: "D4",
    launchValvePin: "D2",
    spark: {
        token: program.token,
        deviceId: program.deviceId
    }
});

// function to link up launcher to websocket
var linkSocket = function (socket, launcher) {

    // Emit launcher ready
    launcher.on('launcher-ready', function(data) {
        socket.emit('ready', data);
    });

    // Emit launcher data
    launcher.on('launcher-data', function(data) {
        socket.emit('data', data);
    });

    // Emit launch valve data
    launcher.on('launchValve', function(data) {
        socket.emit('launchValve', data);
    });

    // Emit fill valve data
    launcher.on('fillValve', function(data) {
        socket.emit('fillValve', data);
    });

    // open and close valves
    socket.on('openFill', function() {
        launcher.openFill();
    });

    socket.on('closeFill', function() {
        launcher.closeFill();
    });

    socket.on('openLaunch', function() {
        launcher.openLaunch();
    });

    socket.on('closeLaunch', function() {
        launcher.closeLaunch();
    });

    socket.on('reset', function() {
        launcher.reset();
    });
};

// Connect up the socket on connection
io.sockets.on('connection', function(socket) {
    socket.emit('hello');
    linkSocket(socket, myLauncher);
});
