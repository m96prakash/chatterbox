var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var fs = require('fs');
app.use(express.static('public'));
var onlineUsers = {};

io.on('connection', function(socket){
    
    var userName = null;
    var roomName = null;
    
    //creating chat room
    socket.on('createRoom',function(data){
        userName = data.userName;
        userIP = data.ip;
        //creating or joining room
        socket.nickname = userName;
        socket.join(data.roomName);

        // onlineUsers[userName]=data.userName;
        //onlineUsers[data.roomName] += ','+userName;
        //var clients = io.sockets.clients(data.roomName);
        roomName = data.roomName;
        thisRoomUsers = [];
        //write to file
        fs.exists('users.json', function(exists)
        {
            if(exists)
            {
                fs.readFile('users.json', 'utf8',function readFileCallback(err, fileData){
                    if(err){
                        console.log(err);
                    }
                    else{
                        obj = JSON.parse(fileData);
                        
                        for(var u in obj.users){
                            //console.log(u);
                            if(obj.users[u].roomName == roomName){
                                thisRoomUsers.push({userName:obj.users[u].userName,userIP:obj.users[u].ip});
                            }
                        }
                        
                        thisRoomUsers.push({userName:userName,userIP:userIP});
                        obj.users.push({roomName:roomName,userName:userName,ip:userIP});
                        json = JSON.stringify(obj);
                        fs.writeFile('users.json', json, 'utf8');
                        //broadcasting new user joined to all other sockets in room
                        socket.broadcast.in(data.roomName).emit('user joined','<span style="color:#10c469 !important;"><strong>'+userName+'</strong> joined.</span><br>');
                        io.sockets.in(data.roomName).emit('updateUsers',thisRoomUsers);
                    }
                });
            }
        });
        
    });
    
    
    //Server receives message from client
    socket.on('messageForServer',function(data){
        //will alert all users with message
     io.sockets.in(data.roomName).emit('messageToBeDisplayed',{message:data.message+'<br>',user:data.userName}); 
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
        
        thisRoomUsers = [];
        fs.exists('users.json', function(exists)
        {
            if(exists)
            {
                fs.readFile('users.json', 'utf8',function readFileCallback(err, fileData)
                {
                    if(err){
                        console.log(err);
                    }
                    else
                    {
                        obj = JSON.parse(fileData);
                        // console.log("before for");
                        // console.log(obj.users);
                        for(var u in obj.users)
                        {
                            if(obj.users[u].roomName == roomName && obj.users[u].userName == userName)
                            {
                                obj.users.splice(u, 1);
                            }
                        }
                        console.log(obj.users);
                        for(var u in obj.users){
                            if(obj.users[u].roomName == roomName)
                            {
                                thisRoomUsers.push({userName:obj.users[u].userName,userIP:obj.users[u].ip});
                            }
                        }
                        // var index = thisRoomUsers.indexOf(userName);
                        // thisRoomUsers.splice(index, 1);
                        socket.broadcast.in(roomName).emit('disconnected','<span style="color:#ff4242 !important;"<strong>'+userName+'</strong> left.</span><br>');
                        io.sockets.in(roomName).emit('updateUsers',thisRoomUsers);

                        json = JSON.stringify(obj);
                        fs.writeFile('users.json', json, 'utf8');
                        // console.log("after for");
                        // console.log(obj.users);
                        
                    }
                });
            }
        });
        
    });

    
});


http.listen(3000, function(){
  console.log('listening on localhost:3000');
});