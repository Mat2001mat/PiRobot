var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
var express = require('express'),
 http = require('http'),
 path = require('path'),
 gpio = require('pi-gpio'),
 app = express();
 async = require('async'),

//we use the port 3000
app.set('port', 3000);
app.get('/index1.jpg', new MjpegProxy('http://192.168.1.123:8080/?action=stream').proxyRequest);
 
//we serve the static files of the directory /static
__dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/static')));
 
//we create the server
var http = http.createServer(app).listen(app.get('port'), function(){
 console.log('Server was started by using the port ' + app.get('port'));
});
 
//we initialise socket.io
var io = require('socket.io')(http);
 
//the code controlling the PiRobot starts here
//----------------------------------
 
//we create the object PiRobot
var PiRobot = {
 
 //we create an object with the used pins
 motors: {
   leftMotorPWM: 12,
   rightMotorPWM: 32,
   leftFront: 31,
   leftBack: 33,
   rightFront: 35,
   rightBack: 37
 },
  
 //we open the gpio pins and set them as outputs
 init: function(){
     gpio.open(this.motors.leftFront, "output");
     gpio.open(this.motors.leftBack, "output");
     gpio.open(this.motors.rightFront, "output");
     gpio.open(this.motors.rightBack, "output");
 },
 
 //in order to move the tank forward, we supply both motors
 moveForward: function(){
   async.parallel([
     console.log('Drive forward'),
     gpio.write(this.motors.leftFront, 1),
     gpio.write(this.motors.rightFront, 1)
   ]);
 },
 
 moveBackward: function(){
   async.parallel([
     gpio.write(this.motors.leftBack, 1),
     gpio.write(this.motors.rightBack, 1),
     console.log('Drive backwards')
   ]);
 },
 
  //in order to turn right, we supply the motor on the left
 moveLeft: function(){
   gpio.write(this.motors.leftFront, 1);
   console.log('Turn left');
 },
 
  //in order to turn left, we supply the motor on the right
 moveRight: function(){
   gpio.write(this.motors.rightFront, 1);
   console.log('Turn right');
 },

 stop: function(){
   async.parallel([
     console.log('Stop'),
     gpio.write(this.motors.leftFront, 0),
     gpio.write(this.motors.leftBack, 0),
     gpio.write(this.motors.rightFront, 0),
     gpio.write(this.motors.rightBack, 0)
   ]);
 }
};
 
//we listen to new connections
io.sockets.on('connection', function(socket) {
 var clientIp = socket.request.connection.remoteAddress;
 console.log('Client connected ' + clientIp);
 
 socket.on("disconnect", function () {
  var clientIp = socket.request.connection.remoteAddress;
  console.log('Client disconnected ' + clientIp);
 });
 
 //we listen the movement signal
 socket.on('move', function(direction) {
   switch(direction){
     case 'up':
       PiRobot.moveForward();
       break;
     case 'down':
       PiRobot.moveBackward();
       break;
     case 'left':
       PiRobot.moveLeft();
       break;
     case 'right':
       PiRobot.moveRight();
       break;
   }
 });
 //we listen to the stop signal
 socket.on('stop', function(dir){
   PiRobot.stop();
 });
 
});
 
//we initialise the PiRobot
PiRobot.init();
