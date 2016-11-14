It's giving me cannot read property of undefined error in server.js file at this line

    io.nsps['/'].adapter.rooms[roomName].length;

I want to display all the names of users those are connected in the chat room..
I take user name and room name by prompt when first time loads the page...

I am using socket.io v1.5.1

I have tried almost all the codes that are available for >v1.0 but i failed.

Here is my code..

server.js

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
            socket.join(data.roomName);
            roomName = data.roomName;
            //broadcasting new user joined to all other sockets in room
            socket.broadcast.in(data.roomName).emit('user joined','<span style="color:#10c469 !important;"><strong>'+userName+'</strong> has joined chatroom.</span><br>');
            
        });
        
        var userLength = io.nsps['/'].adapter.rooms[roomName].length;
        //Server receives message from client
        socket.on('messageForServer',function(data){
            //will alert all users
            socket.emit('all users',userLength);
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

index.html

    <!DOCTYPE html>
    <html>
        <head>
            <title>ChatterBox</title>
            <link rel="stylesheet" type="text/css" href="bootstrap/css/bootstrap.css">
            <link rel="stylesheet" type="text/css" href="bootstrap/css/main.css">
            <link rel="stylesheet" type="text/css" href="css/core.css">
            <link rel="stylesheet" type="text/css" href="css/components.css">
        </head>
        <style>
            .bottom{
                position: fixed;     
               text-align: center;    
               bottom: 10px; 
               width: 100%;
            }
            .wrapper{
                padding-top: 4%;
            }
        </style>
        <body>
            <div class="container"> 
                <div class="row">
                    
                    <nav class="navbar navbar-default navbar-fixed-top">
                         ChatterBox 
                    </nav>
                    <div class="wrapper">
                        <div class="col-md-7 col-md-offset-2">
                            <div id="message-container"></div>
                        </div>
                        <div class="col-md-3">
                            <div id="typer-container"></div>
                        </div>
                        <div class="form-group  bottom">
                            <div class="col-md-7 col-md-offset-2">
                                <input type="text" id="message" class="form-control" placeholder="Enter message here">
                            </div>
                            <div class="col-md-1">
                                <button type="button" onclick="sendMessage()" class="btn btn-trans btn-inverse waves-effect w-md waves-light m-b-5">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </body>
        <script type="text/javascript" src="js/jquery.min.js"></script>
        <script type="text/javascript" src="js/app.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            //initialize socket library and its object
            var socket = io();
            
            //taking input from user
            var roomName = prompt("Enter name of chat room that you want to create or join");
            var userName = prompt("Enter your username");
          
            //create chat room
            socket.emit('createRoom',{roomName:roomName,userName:userName});
    
            //when user joins the chat room
            socket.on('user joined',function(data){
                document.getElementById('message-container').innerHTML += data;
            });
            
            //to display when user leave chat room
            socket.on('disconnected',function(data){
                document.getElementById('message-container').innerHTML += data;
            });
            
            //Press enter to send message code
            $('#message').keypress(function(event){
                if(event.which == 13){
                    sendMessage();
                }
            });
            
            //Send message to server
            function sendMessage()
            {
                var msg = document.getElementById('message').value;
                document.getElementById('message').value = '';
                if(msg){
                    socket.emit('messageForServer', {message: msg, roomName:roomName,userName: userName});
                }
            }
            
            var typing = false;
            var timeout = undefined;
            
            //when user is no longer typing
            function timeoutFunction(){
              typing = false;
              socket.emit('noLongerTyping');
            }
            
            function onKeyDownNotEnter(){
              if(typing == false) {
                  
                typing = true;
                socket.emit('userIsTyping',userName+' is typing...');
                timeout = setTimeout(timeoutFunction, 5000);
                  
              } else {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
              }
    
            }
            //User is typing functionality
            $('#message').keyup(function(event){
                if(event.which != 13 && userName != ''){
                    onKeyDownNotEnter();
                }
            });
            
            socket.on('all users',function(data){
                alert(data);
            });
            
            //users will see who is typing from this code
            socket.on('userIsStillTyping',function(data){
                document.getElementById('typer-container').innerHTML += data;
            });
            
            //remove user is typing
            socket.on('userIsNotTyping',function(){
                document.getElementById('typer-container').innerHTML = '';
            });
            
            //Display broadcasted message
            socket.on('messageToBeDisplayed',function(data){
                document.getElementById('message-container').innerHTML += data;
            });
            
        </script>
    </html>