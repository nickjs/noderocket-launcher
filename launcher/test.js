var five = require("johnny-five");
var Spark = require("spark-io");

var board = new five.Board({
  io: new Spark({
    token: "ca4e673cda4ca92aae5ebe7890d191697868fc94",
    deviceId: "55ff6e064989495346512587"
  })
});


board.on("ready", function() {
  console.log("ready");


  board.analogRead("A0", function(data){
    console.log(data);
  });


//  board.digitalWrite("D7", 0);
//  board.digitalWrite("D7", 1);
  board.digitalWrite("D2", 1);
//  board.digitalWrite("D4", 1);
});