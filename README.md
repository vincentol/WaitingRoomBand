Sources:

https://github.com/node-serialport/node-serialport

https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0


How to run this code:

Clone this repo

open up server.js in your favorite text editor.
change line 10 to your desired serial port that you will use for your arduino

Open a terminal
run `npm install`
(make sure you have nodemon install globally, you can do this with `npm install -g nodemon`)
run `nodemon server`

Open a 2nd terminal (or a new terminal tab)
run `cd client`
run `npm start`

Hook up arduino.
type rs in the first terminal to restart server and start listening to arduino outputs
Go to your browser, with localhost:3000 open. Hit the power button to callibrate the arduino.
Wait a few seconds and watch the arduino track your vitals.
