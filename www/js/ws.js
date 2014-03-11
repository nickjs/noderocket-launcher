var socket = io.connect('http://localhost');
socket.on('ready', function (data) {
  console.log('Launcher Ready!',data);
});

socket.on('hello', function(data) {
  console.log('Hello, RocketMan');
  socket.emit('start', {
    dataInterval: 100
  });
});

socket.on('data', function (data) {
  console.log('Data', data);
  var value = Math.floor(data.pressure).toString().split('');
  value.unshift(' ');
  value.unshift(' ');
  value.unshift(' ');
  value = value.slice(-3).join('');
  display.setValue(value);

  updateDial(data.pressure);
});


function fillAndLaunch(psi) {
  console.log('fillAndLaunch');
  socket.emit('fillAndLaunch', psi);
}

function fill() {
  console.log("fill");
  socket.emit('fill');
}

function launch() {
  console.log("launch");
  socket.emit('launch');
}

