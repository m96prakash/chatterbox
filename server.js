var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.use(express.static('public'));

io.on('connection', function(socket){
    
    var userName = null;
    var roomName = null;
    
    //creating chat room
    socket.on('createRoom',function(data){
        userName = data.userName;
        //creating or joining room
        socket.nickname = userName;
        socket.join(data.roomName);
        roomName = data.roomName;
        //broadcasting new user joined to all other sockets in room
        socket.broadcast.in(data.roomName).emit('user joined','<span style="color:#10c469 !important;"><strong>'+userName+'</strong> has joined chatroom.</span><br>');
        
    });
    
    
    //Server receives message from client
    socket.on('messageForServer',function(data){
        //will alert all users
        var userLength = Object.keys(io.nsps['/'].adapter.rooms);
        var sockets = Object.keys(io.nsps['/'].adapter.rooms['ravi']['sockets']);
     io.sockets.in(data.roomName).emit('messageToBeDisplayed','<strong>'+data.userName+'</strong> : '+data.message+'<br>'); 
    });
    
    //when user is typing
    socket.on('userIsTyping',function(data){
       socket.broadcast.in(roomName).emit('userIsStillTyping','<span style="color:#ff4242 !important;"<strong>'+userName+'</strong></span> is typing...</br>');
    });
    
    //when user stops typing
    socket.on('noLongerTyping',function(data){
        socket.broadcast.in(roomName).emit('userIsNotTyping');
    });
    
    //when user gets bored
    socket.on('disconnect',function(){
        socket.broadcast.in(roomName).emit('disconnected','<span style="color:#ff4242 !important;"<strong>'+userName+'</strong> has left the chat room.</span><br>');
    });
});


http.listen(3000, function(){
  console.log('listening on localhost:3000');
});