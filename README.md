noderocket-launcher
===================

This is the control software for the [noderockets](http://www.noderockets.com/) water rocket launcher.

The master branch contains the basic software to make the launcher work.  It is meant to be as simple as possible to aid learning.

The advanced branch contains more a more exciting version.

Read more about it at http://www.noderockets.com/

Running the Project
-------------------
__Prerequisites__

- [nodejs](http://nodejs.org/) installed
- [npm](https://www.npmjs.org/) installed
- a [noderockets launcher control system](http://www.noderockets.com/launcher_control.html) assembled and plugged in via USB
- the Arduino board should be flashed with the standard firmata as described on the [johnny-five project](https://github.com/rwaldron/johnny-five)

__Running__

1. Install packages:
    npm install
2. Run the server:
    node server.js
3. Open the UI at http://localhost:8082

Explanations
------------
__launcher.js__

This file contains the launcher class, which uses [johnny-five](https://github.com/rwaldron/johnny-five) to connect to a the Arduino in a [noderockets launcher control system](http://www.noderockets.com/launcher_control.html).  This class needs to do the following:
- Turn on and off a digital I/O pin to open or close the launcher fill valve.
- Turn on and off a digital I/O pin to open or close the launcher launch valve.
- Read the voltage on an analog I/O pin and from this voltage, calculate the pressure reading from an automobile oil pressure sender.

__server.js__

This file contains the web server, which does the following:
- Create a launcher instance.
- Serves up files from the www directory.
- Listens for incoming websocket connections.  When a connection is made it wires up websocket events to call launcher methods or respond to launcher events.

__index.html__

This file contains the user interface, which does the following:
- Connects a websocket to the server.
- Displays the current pressure of the rocket.
- Displays the state of the fill and launch valves.
- Provides buttons to open and close the fill valve.
- Provides buttons to open and close the launch valve.
- Provides a button to reset the launcher, which closes all of the valves.
