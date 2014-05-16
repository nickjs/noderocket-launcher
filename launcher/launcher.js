var events = require('events');
var j5 = require("johnny-five");
var _ = require('underscore');

function Launcher(opts) {
  this.config = _.extend({
    pressureSensorPin: "A0",
    fillValvePin: 2,
    launchValvePin: 3,
    dataInterval: 200,
    maxPsi: 50,
    holdAfterLaunch: 2000,
    pressure: {
        slope: 0.5479,
        yint: 2.2272
    }
  }, opts);

  this.currentPsi = 0;
  this.board = this.config.board == null ? new j5.Board() : this.config.board;

  events.EventEmitter.call(this);

  var thiz = this;

  this.board.on('ready', function () {
    thiz.pressureSensor = new j5.Sensor(thiz.config.pressureSensorPin);
    thiz.fillValve = new j5.Pin(thiz.config.fillValvePin);
    thiz.launchValve = new j5.Pin(thiz.config.launchValvePin);

    // Make sure valves are closed
    thiz.closeFill();
    thiz.closeLaunch();

    thiz.pressureSensor.on('data', function () {
      var voltage = this.value * 0.004882814;  // (value / 1024) * 5
      //console.log(voltage + "V");
      //var res = ((100 * 5)/voltage) - 100; // voltage divider solve for R1 with Vin = 5 and R2 = 100ohm
      var res = 270 / ((5 / voltage) - 1); // voltage divider solve for R2 with Vin = 5 and R1 = 270ohm
      //console.log(res + " ohm");

      // using linear equation to find pressure in psi - this seems pretty accurate until maybe 80 psi
      thiz.currentPsi = (res * thiz.config.pressure.slope) - thiz.config.pressure.yint;
      //console.log(thiz.currentPsi + ' PSI');
    });

    // THIS IS ONLY FOR TESTING USING A POTENTIOMETER
//    thiz.pressureSensor.scale([0, 160]).on("data", function() {
//      thiz.currentPsi = this.value;
//    });


    thiz.emit('launcher-ready', thiz.currentPsi);

    setInterval(function () {
      thiz.emit('launcher-data', {
        pressure: thiz.currentPsi
      });
    }, thiz.config.dataRate);
  });
}

Launcher.prototype.__proto__ = events.EventEmitter.prototype;

Launcher.prototype.openLaunch = function() {
    this.launchValve.high();
    this.emit('launchValve', {state: 'open'});
};

Launcher.prototype.closeLaunch = function() {
    this.launchValve.low();
    this.emit('launchValve', {state: 'closed'});
};

Launcher.prototype.openFill = function() {
    this.fillValve.high();
    this.emit('fillValve', {state: 'open'});
};

Launcher.prototype.closeFill = function() {
  this.fillValve.low();
  this.emit('fillValve', {state: 'closed'});
};

Launcher.prototype.reset = function () {
    this.closeLaunch();
    this.closeFill();
}

Launcher.prototype.fill = function() {
    this.closeLaunch();     // Close launch valve
    this.openFill();
};

Launcher.prototype.fillTo = function(psi, launch) {
    this.fill();

    // Monitor pressure and stop fill
    var thiz = this;
    var psiChecker = setInterval(function() {
        if (thiz.currentPsi > psi || thiz.currentPsi > thiz.config.maxPsi) {
            clearInterval(psiChecker);

            if(launch) {
                thiz.launch();
            } else {
                // Just close the fill valve
                thiz.closeFill();
            }
        }
    }, 5);
};

Launcher.prototype.launch = function() {
  this.openLaunch();
  this.emit('launched');

  // Close fill valve and launch valve after configured amount of time
  var thiz = this;
  setTimeout(function(){
    thiz.closeFill();
    thiz.closeLaunch();
  }, thiz.config.holdAfterLaunch);
};

module.exports = Launcher;