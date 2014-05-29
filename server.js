// use express and listen for new websocket connections
// turn off the websocket debug messages
var express = require('express');
var app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server, {log:false});

// include the launcher
var Launcher = require('./launcher');

// other crap
var say = require('say');

var Player = require('player');
var music = new Player('./res/final_countdown.short.mp3');

// serve up static files
app.use(express.static('www'));

// listen on port 8082
server.listen(8082);

var actions = ['openFill', 'closeFill', 'openLaunch', 'closeLaunch', 'reset'];

// server index.html by default
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// create the launcher instance
// var myLauncher = new Launcher();

var makeAction = function(action) {
    return function() {
        if (action == "openLaunch") {
            music.play();
            say.speak('Alex', '3');

            var timeout = 2000;
            var voice = 'Alex';
            setTimeout(function() {
                say.speak(voice, '2');
                setTimeout(function() {
                    say.speak(voice, '1');
                    setTimeout(function() {
                        say.speak(voice, 'Ignition');
                        // myLauncher.openLaunch();
                    }, timeout);
                }, timeout);
            }, timeout);
        } else {
            return myLauncher[action]();
        }
    };
};

var serverAction = function(action, callback) {
    return function(req, res) {
        console.log(action);
        callback(action);

        res.write(action);
        res.end();
    };
};

for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    var func = makeAction(action);

    app.get('/' + action, serverAction(action, func));
}

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
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        socket.on(action, makeAction(action));
    }
};

// Connect up the socket on connection
io.sockets.on('connection', function(socket) {
    socket.emit('hello');
    linkSocket(socket, myLauncher);
});
