var five = require("johnny-five");
var Spark = require("spark-io");


var board = new five.Board({
  io: new Spark({
    token: "57e35cb0e246a3a3caf9077038a95370699e375d",
    deviceId: "55ff6e064989495346512587"
  })
});

board.on("ready", function() {
  board.analogRead("A0", function(data){
    console.log(data);
  })
});