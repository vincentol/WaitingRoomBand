import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:5000');
function subscribeToTimer(cb) {
  socket.on('newMessage', socketVals => cb(null, socketVals));
  // socket.emit('subscribeToTimer', 1000);
}

function setVibrate(bool) {
  socket.emit('setVibrate', bool);
}

export { subscribeToTimer, setVibrate };
