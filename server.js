const express = require('express');
const app = express();
const tcpport = process.env.PORT || 5000;
const http = require('http').Server(app);
// const allowedOrigins = 'localhost:3000';
const io = require('socket.io')(http);
const SerialPort = require('serialport');

const port = new SerialPort('/dev/cu.SLAB_USBtoUART', {
  baudRate: 115200
});

const byteParser = new SerialPort.parsers.ByteLength({ length: 1 });
port.pipe(byteParser);

// Values to send over to Arduino.
const HIGH = Buffer.from([1]);
const LOW = Buffer.from([0]);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
  next();
});

app.get('/api/hello', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.send({ express: 'Hello From Express' });
});

console.log(io.on);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      socket.emit('timer', new Date());
    }, interval);
  });

  /**
   * Socket listener to determine whether or not to send HIGH / LOW
   * values to Arduino.
   */
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

  socket.on('setVibrate', (msg) => {
    console.log('Message received: ', msg);
    if (msg) {
      port.write(HIGH);
    } else {
      port.write(LOW);
    }
  });
});

port.on('open', () => {
  console.log('Port is open!');
});

/**
 * listen to the bytes as they are parsed from the parser.
 */
let arrayAsString;
byteParser.on('data', (data) => {
  let message;
  stringData = data.toString('utf8')
  if (stringData === '[') {
    arrayAsString = '[';
  } else if (stringData === ']') {
    // todo emit array
    arrayAsString += ']';
    console.log(arrayAsString);
    io.sockets.emit('newMessage', arrayAsString);
    // let arrayAsArray = JSON.parse(arrayAsString);
    // console.log(arrayAsArray);
    // C F BPM AVGBPM
  } else {
    arrayAsString += stringData;
  }

  // if (HIGH.compare(data) === 0) {
  //   message = 'LED successfully turned on.';
  // } else if (LOW.compare(data) === 0) {
  //   message = 'LED successfully turned off.';
  // } else {
  //   message = 'LED did not behave as expected.';
  // }

  // io.sockets.emit('new message', message);
});

port.on('close', () => {
  console.log('Serial port disconnected.');
  io.sockets.emit('close');
});

// app.listen(tcpport, () => console.log(`Listening on port ${tcpport}`));
http.listen(5000);
