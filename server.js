// Setup basic express server
const express = require('express');
const app = express();
const tcpport = process.env.PORT || 5000;
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SerialPort = require('serialport');

// Open serial port
const port = new SerialPort('/dev/cu.SLAB_USBtoUART', {
  baudRate: 115200
});

// Start parser for data from serial port
const byteParser = new SerialPort.parsers.ByteLength({ length: 1 });
port.pipe(byteParser);

// Values to send over to Arduino.
const HIGH = Buffer.from([1]);
const LOW = Buffer.from([0]);
const CALON = Buffer.from(['k']);

// Fix no CORS error for demonstration purposes
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
  next();
});

// Test api endpoint to test express server
app.get('/api/hello', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.send({ express: 'Hello From Express' });
});

// Start socket connection
io.on('connection', (socket) => {
  console.log('a user connected');

  // Example socket connection
  socket.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      socket.emit('timer', new Date());
    }, interval);
  });

  // Example socket listener to write to arduino
  socket.on('message', (msg) => {
    console.log('Message received: ', msg);
    switch (msg) {
      case 'on':
        // port.write(HIGH);
        break;
      case 'off':
        // port.write(LOW);
        break;
      default:
        break;
    }
  });

  // Tells arduino to activate vibration motor
  socket.on('setVibrate', (msg) => {
    console.log('Message received: ', msg);
    if (msg) {
      port.write(HIGH);
    } else {
      port.write(LOW);
    }
  });

  // Tells arduino to calibrate
  socket.on('calibrate', (msg) => {
    console.log('Message received: ', msg);
    if (msg) {
      port.write(CALON);
    }
  });
});

// Opens port to listen to arduino
port.on('open', () => {
  console.log('Port is open!');
});

/**
 * listen to the bytes as they are parsed from the parser.
 */
let arrayAsString; // Build an array from the string that is recieved
byteParser.on('data', (data) => {
  let message;
  stringData = data.toString('utf8')
  if (stringData === '[') {
    arrayAsString = '[';
  } else if (stringData === ']') {
    arrayAsString += ']';
    console.log(arrayAsString);
    // After array is built, we can send it via socket
    io.sockets.emit('newMessage', arrayAsString);
  } else {
    arrayAsString += stringData;
  }
});

// Close socket
port.on('close', () => {
  console.log('Serial port disconnected.');
  io.sockets.emit('close');
});

// app.listen(tcpport, () => console.log(`Listening on port ${tcpport}`));
// Start server
http.listen(5000);
