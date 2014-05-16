// pull URL params into an object
var search = location.search.substring(1);
var params = search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
    function(key, value) { return key===""?value:decodeURIComponent(value) }):{}

var socket = io.connect('http://localhost');
socket.on('ready', function (data) {
  console.log('Launcher Ready!',data);
});

socket.on('hello', function(data) {
  console.log('Hello, RocketMan');
  socket.emit('start', {
    launcher: params.launcher == null ? 'l1' : params.launcher
  });
});

socket.on('data', function (data) {
  var value = Math.floor(data.pressure).toString().split('');
  value.unshift(' ');
  value.unshift(' ');
  value.unshift(' ');
  value = value.slice(-3).join('');
  display.setValue(value);

  updateDial(data.pressure);
});

socket.on('fillValve', function (data) {
    document.getElementById("fillValveStatus").innerHTML = data.state;
})

socket.on('launchValve', function (data) {
    document.getElementById("launchValveStatus").innerHTML = data.state;
})

function reset() {
    socket.emit('reset');
}

function fillAndLaunch(psi) {
  socket.emit('fillAndLaunch', psi);
}

function fill() {
  socket.emit('fill');
}

function launch() {
  socket.emit('launch');
}

function reset() {
    socket.emit('reset');
}

