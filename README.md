noderocket-launcher
===================

This is the control software for the [noderockets](http://www.noderockets.com/) water rocket launcher.

The master branch contains the basic software to make the launcher work.

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
