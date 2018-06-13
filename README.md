# Sources

https://github.com/sparkfun/MAX30105_Particle_Sensor_Breakout

https://github.com/node-serialport/node-serialport

https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0


# How to run this code

First, clone this repo, then follow the set up guide below.

## Setting up the Arduino

### Hardware

The hardware requirements are as follows:

1. Arduino (we used an Arduino Metro, which has the same microprocessor as the Uno)
2. Vibration Motor
3. MAX30105 Particle Sensor

The vibration motor is connected by the + wire going to pin 6, and the - wire going to ground.
The MAX30105 is connected to 5V, GND, SDA, and SCL. These pinouts are written on the sensor board
itself, and can be wired to those respective pins on the arduino.

### Software

1. Open up arduino
2. Go to Sketch > Include Library > Manage Libraries
3. Search for "MAX30105" and install the library
4. Upload our `.ino` onto the Arduino

## Setting up the Web Interface

1. Open up server.js in your favorite text editor.
2. Change line 10 to your desired serial port that you will use for your arduino

3. Open a terminal
   run `npm install`
   (make sure you have nodemon install globally, you can do this with `npm install -g nodemon`)
   run `nodemon server`

4. Open a 2nd terminal (or a new terminal tab)
   run `cd client`
   run `npm start`

5. Hook up arduino.
6. Type rs in the first terminal to restart server and start listening to arduino outputs
7. Go to your browser, with localhost:3000 open. Hit the power button to callibrate the arduino.
8. Wait a few seconds and watch the arduino track your vitals.
