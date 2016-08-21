var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
var express = require('express'),
 http = require('http'),
 path = require('path'),
 rpio = require('rpio');
 app = express();
 
 
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
 
//the code controlling the tank starts here
//----------------------------------
 
//we create the object tank
var tank = {
 
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
     rpio.open(this.motors.leftMotorPWM, rpio.PWM);
     rpio.open(this.motors.rightMotorPWM, rpio.PWM);
     rpio.pwmSetClockDivider(64);
     rpio.pwmSetRange(this.motors.leftMotorPWM, 1024);
     rpio.pwmSetRange(this.motors.rightMotorPWM, 1024);
     rpio.pwmSetData(this.motors.leftMotorPWM, 0);
     rpio.pwmSetData(this.motors.rightMotorPWM, 0);
     rpio.open(this.motors.leftFront, rpio.OUTPUT, rpio.LOW);
     rpio.open(this.motors.leftBack, rpio.OUTPUT, rpio.LOW);
     rpio.open(this.motors.rightFront, rpio.OUTPUT, rpio.LOW);
     rpio.open(this.motors.rightBack, rpio.OUTPUT, rpio.LOW);
 },
 
 //in order to move the tank forward, we supply both motors
 moveForward: function(){
     rpio.write(this.motors.leftFront, rpio.HIGH);
     rpio.write(this.motors.rightFront, rpio.HIGH);
     rpio.write(this.motors.leftBack, rpio.LOW);
     rpio.write(this.motors.rightBack, rpio.LOW);
     console.log('Drive forward');
 },
 
 //in order to move the tank backwards we supply the motors, but with inverse polarity
 moveBackward: function(){
     rpio.write(this.motors.leftFront, rpio.LOW);
     rpio.write(this.motors.rightFront, rpio.LOW);
     rpio.write(this.motors.leftBack, rpio.HIGH);
     rpio.write(this.motors.rightBack, rpio.HIGH);
     console.log('Drive backwards');
 },
 
 //in order to turn right, we supply the motor on the left
 moveLeft: function(){
     rpio.write(this.motors.leftFront, rpio.LOW);
     rpio.write(this.motors.rightFront, rpio.HIGH);
     rpio.write(this.motors.leftBack, rpio.HIGH);
     rpio.write(this.motors.rightBack, rpio.LOW);
     console.log('Turn left');
 },
 
 //in order to turn left, we supply the motor on the right
 moveRight: function(){
     rpio.write(this.motors.leftFront, rpio.HIGH);
     rpio.write(this.motors.rightFront, rpio.LOW);
     rpio.write(this.motors.leftBack, rpio.LOW);
     rpio.write(this.motors.rightBack, rpio.HIGH);
     console.log('Turn right');
 },
 
 //Sets the speed to half
 half: function(){
     rpio.pwmSetData(this.motors.leftMotorPWM, 768); // Set speed to speed
     rpio.pwmSetData(this.motors.rightMotorPWM, 768); // Set speed to speed
     console.log('Half Speed');
 },
 
//Sets the speed to half
 full: function(){
     rpio.pwmSetData(this.motors.leftMotorPWM, 1024);  // Set speed to speed
     rpio.pwmSetData(this.motors.rightMotorPWM, 1024); // Set speed to speed
     console.log('Full Speed');
 },
 
//Sets the speed to half
 noSpeed: function(){
     rpio.pwmSetData(this.motors.leftMotorPWM, 0);  // Set speed to speed
     rpio.pwmSetData(this.motors.rightMotorPWM, 0); // Set speed to speed
     console.log('No Speed');
 },
  
 
 //in order to stop both motors, we set the all pins to 0 value
 stop: function(){
     rpio.write(this.motors.leftFront, rpio.LOW);
     rpio.write(this.motors.rightFront, rpio.LOW);
     rpio.write(this.motors.leftBack, rpio.LOW);
     rpio.write(this.motors.rightBack, rpio.LOW);
     console.log('Stop');
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
     case 'full':
       tank.full();
       break;
     case 'half':
       tank.half();
       break;
     case 'noSpeed':
       tank.noSpeed();
       break;   
     case 'up':
       tank.moveForward();
       break;
     case 'down':
       tank.moveBackward();
       break;
     case 'left':
       tank.moveLeft();
       break;
     case 'right':
       tank.moveRight();
       break;
   }
 });
 //we listen to the stop signal
 socket.on('stop', function(dir){
   tank.stop();
 });
 
});
 
//we initialise the tank
tank.init();