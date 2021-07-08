const http = require('http'),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  bodyParser = require('body-parser'),
  webpagePort = 8080,
  WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    server: server
  }),
  // pigpio: Python module for the Raspberry
  // Gpio: Used to connect microcontrollers to the distance Sensor
  Gpio = require('pigpio').Gpio,
  //ms per cm
  mscm = 0.029,
  trigger = new Gpio(23, {
    mode: Gpio.OUTPUT
  }),
  echo = new Gpio(24, {
    mode: Gpio.INPUT,
    alert: true
  });

let lastScoreTime = new Date();
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Error');
});
server.listen(webpagePort, function () {
  console.log('Server running on: ' + webpagePort);
});
wss.on('connection', function connection(ws) {
  console.log('WebSockets!');
});

function display(message) {
  if (message) {
    wss.clients.forEach(function each(client) {
      client.send(message);
    });
  }
}
//Must be low
trigger.digitalWrite(0);

//Ultrasonic Distance Sensor 
const distanceSensor = () => {
  let startMark;
  echo.on('alert', (level, mark) => {
    if (level == 1) {
      startMark = mark;
    } else {
      const endMark = mark;
      // Use of bitwise operator >> to truncate the decimal instead of Math.floor
      const diff = (endMark >> 0) - (startMark >> 0);
      let distance = diff / 2 / mscm;
      let currentScoreTime = new Date();
      console.log(currentScoreTime, lastScoreTime, distance);
      if (distance < 10 && (currentScoreTime - lastScoreTime > 1000)) {
        lastScoreTime = currentScoreTime;
        display('Score:' + (diff / 2 / mscm));
      }
    }
  });
};

distanceSensor();

setInterval(() => {
  //0.01 ms, trigger every 100 ms
  trigger.trigger(10, 1);
}, 100);