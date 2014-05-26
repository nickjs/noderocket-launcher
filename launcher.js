// We load our dependencies - node's events, johnny-five, and underscore utilities.

var events = require('events');
var j5 = require('johnny-five');
var _ = require('underscore');
var Spark = require('spark-io');


function Launcher(opts) {

    /*
     This code provides some defaults for our class's configuration parameters.
     Configuration parameters will allow us to specify the pins for the
     pressure sensor, fill valve, and launch valve, specify the frequency
     at which we will publish pressure data, and define the slope and
     y-intercept of the linear equation to calculate the pressure from
     the pressure sensor's resistance.
     */

    this.config = _.extend({
        pressureSensorPin: "A0",
        fillValvePin: 2,
        launchValvePin: 3,
        dataInterval: 200,
        pressure: {
            // parameters to measure from a SunPro CP7577 oil pressure sender
            // http://www.amazon.com/gp/product/B00029JXMA/ref=oh_details_o00_s00_i00?ie=UTF8&psc=1
            slope: -0.46511,
            yint: -93.95
        }
    }, opts);

    // Create a variable to keep track of the pressure.

    this.currentPsi = 0;

    // Allow passing in a johnny-five board to use.
    // If there isn't one, create a new board.

    if(this.config.board) {
        this.board = this.config.board;
    } else if(this.config.spark) {
        this.board = new j5.Board({
            io: new Spark(this.config.spark)
        });
    } else {
        this.board = new j5.Board();
    }

    // Set up this class as an event emitter.

    events.EventEmitter.call(this);

    // Create a variable that we can use in closures to reference this.

    var thiz = this;

    this.board.on('ready', function() {

        // When the board is ready, create a sensor for the pressure sensor
        // and pins for the valves

        thiz.pressureSensor = new j5.Sensor(thiz.config.pressureSensorPin);
        thiz.fillValve = new j5.Pin(thiz.config.fillValvePin);
        thiz.launchValve = new j5.Pin(thiz.config.launchValvePin);

        // Make sure the valves are closed

        thiz.closeFill();
        thiz.closeLaunch();

        // Handle data from the pressure sensor

        thiz.pressureSensor.on('data', function() {
            // the arduino reads voltage in increments of 1/1024 of 3.3 V

            var voltage = this.value * (3.3 / 1024);

            // Use voltage divider solve for Z2 with Vin = 3.3V and R1 = 270 ohm

            var res = 270 / ((3.3 / voltage) - 1);

            // Use linear equation with configured slope and y intercept
            // to figure pressure

            thiz.currentPsi = (res * thiz.config.pressure.slope) - thiz.config.pressure.yint;
        });

        // signal that the launcher is ready

        thiz.emit('launcher-ready', thiz.currentPsi);

        // report the pressure data at regular intervals

        setInterval(function() {
            thiz.emit('launcher-data', {
                pressure: thiz.currentPsi
            });
        }, thiz.config.dataRate);

    });
}

// make Launcher an event emitter

Launcher.prototype.__proto__ = events.EventEmitter.prototype;

// basic functions to open and close each valve

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

// a reset function to close all valves

Launcher.prototype.reset = function() {
    this.closeLaunch();
    this.closeFill();
};

module.exports = Launcher;