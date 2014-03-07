var Spark = require("spark-io");
var events = require('events');
var j5 = require("johnny-five");
var _ = require('underscore');


function Launcher(opts) {
  this.config = _.extend({
    pressureSensorPin: "A0",
    fillValvePin: "D4",
    launchValvePin: "D7",
    dataRate: 200,
    maxPsi: 80
  }, opts);

  this.currentPsi = 0;

  this.board = new j5.Board({
    io: new Spark({
      token: "57e35cb0e246a3a3caf9077038a95370699e375d",
      deviceId: "55ff6e064989495346512587"
    })
  });

  events.EventEmitter.call(this);

  var thiz = this;

  this.board.on('ready', function () {
//    thiz.pressureSensor = new j5.Sensor(thiz.config.pressureSensorPin);
//    thiz.fillValve = new j5.Pin(thiz.config.fillValvePin);
//    thiz.launchValve = new j5.Pin(thiz.config.launchValvePin);


    thiz.board.analogRead(thiz.config.pressureSensorPin, function (value) {
      var voltage = value * 0.004882814;  // (value / 1024) * 5
      //console.log(voltage + "V");
      //var res = ((100 * 5)/voltage) - 100; // voltage divider solve for R1 with Vin = 5 and R2 = 100ohm
      var res = 270 / ((5 / voltage) - 1); // voltage divider solve for R2 with Vin = 5 and R1 = 270ohm
      //console.log(res + " ohm");

      // using linear equation to find pressure in psi - this seems pretty accurate until maybe 80 psi
      thiz.currentPsi = (res * 0.5479) - 2.2272;
    });


    thiz.emit('launcher-ready', thiz.currentPsi);

    setInterval(function () {
      thiz.emit('launcher-data', {
        pressure: thiz.currentPsi
      });
    }, thiz.config.dataRate);
  });
}

Launcher.prototype.__proto__ = events.EventEmitter.prototype;

Launcher.prototype.fill = function(psi, launch) {
  this.board.digitalWrite(this.config.fillValvePin, 0);
  this.board.digitalWrite(this.config.launchValvePin, 0);
  this.board.digitalWrite(this.config.fillValvePin, 1);

  var thiz = this;
  var psiChecker = setInterval(function() {
    if (thiz.currentPsi > psi || thiz.currentPsi > thiz.config.maxPsi) {
      clearInterval(psiChecker);
      thiz.board.digitalWrite(thiz.config.fillValvePin, 0);
      thiz.emit('filled');

      if(launch) {
        thiz.launch();
      }
    }

  }, 5);
}

Launcher.prototype.launch = function() {
  this.board.digitalWrite(this.config.launchValvePin, 1);
  this.emit('launched');
};


module.exports = Launcher;