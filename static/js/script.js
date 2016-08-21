$(function () {
 var socket = io.connect(), //we connect by using a websocket
   ui = {
     up: $('.btn-up'),
     left: $('.btn-left'),
     down: $('.btn-down'),
     right: $('.btn-right'),
     full: $('.btn-full'),
     half: $('.btn-half'),
     stop: $('.btn-stop'),
     all: $('.btn')
   },
   activeClass = 'is-active',
   isPressed = false;
 
 //we listen to key pressing
 $(document).keydown(function(e){
   //ignores other keys pressed if a key is already pressed
   //we do this in order to avoid sending out several commands
   //when we keep the key pressed
   if(isPressed) return;
 
   isPressed = true;
   switch(e.which){
     case 81: //code for the key q
       socket.emit('move', 'full');
       ui.full.addClass(activeClass);
       break;
     case 69: //code for the key e
       socket.emit('move', 'half');
       ui.half.addClass(activeClass);
       break;
     case 82: //code for the key r
       socket.emit('move', 'stop');
       ui.stop.addClass(activeClass);
       break;
     case 87: //code for the key w
       socket.emit('move', 'up');
       ui.up.addClass(activeClass);
       break;
     case 65: //code for the key a
       socket.emit('move', 'left');
       ui.left.addClass(activeClass);
       break;
     case 83: //code for the key s
       socket.emit('move', 'down');
       ui.down.addClass(activeClass);
       break;
     case 68: //code for the key d
       socket.emit('move', 'right');
       ui.right.addClass(activeClass);
       break;
   }
 });
 
 //stops the motors when a key is released
 $(document).keyup(function(e){
   ui.all.removeClass(activeClass);
   socket.emit('stop');
   isPressed = false;
 });
});