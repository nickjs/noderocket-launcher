var j5 = require("johnny-five");
var board, goValve, fillValve, pSense;

board = new j5.Board();

board.on("ready", function() {

    pSense = new j5.Sensor("A0");
    fillValve = new j5.Pin(3);
    goValve = new j5.Pin(2);

    //myLed.strobe( 1000 );

    // make myLED available as "led" in REPL

    var curPress = 0;

    var launch = function () {
        goValve.high();
        setTimeout(function() {
            goValve.low();
        }, 500);
    };

    var fill = function() {
        fillValve.high();
        setTimeout(function() {
            fillValve.low();
        }, 2000);
    };

    var test = function (pTarget) {
        fillValve.low();
        goValve.low();
        fillValve.high();

        var checker = setInterval(function() {
            console.log("filling pressure " + curPress + " psi");
            if(curPress > pTarget) {
                clearInterval(checker);
                fillValve.low();
                console.log("done filling - " + press() + " psi");
                setTimeout(function() {
                    goValve.high();
                    console.log("launching - " + press() + " psi");
//                setTimeout(function () {
//                    goValve.low();
//                    console.log("done launching - " + press() + " psi");
//                }, 1000);
                }, 50);
            }
        }, 5);

    };

    var p = function () {
        console.log(curPress + " psi");
    };

    pSense.on("data", function() {
        var voltage = this.value * 0.004882814;  // (value / 1024) * 5
        //console.log(voltage + "V");
        //var res = ((100 * 5)/voltage) - 100; // voltage divider solve for R1 with Vin = 5 and R2 = 100ohm
        var res = 270 / ((5/voltage) - 1); // voltage divider solve for R2 with Vin = 5 and R1 = 270ohm
        //console.log(res + " ohm");

        var press = (res * 0.5479) - 2.2272; // using linear equation to find pressure in psi - this seems pretty accurate until maybe 80 psi

        curPress = press;
        //console.log(press + " psi");
    });

    var press = function() {
        return curPress;
    }

    this.repl.inject({
        goValve: goValve,
        fillValve: fillValve,
        fill: fill,
        p: p,
        runTest: test,
        launch: launch,
        press: press
    });

});