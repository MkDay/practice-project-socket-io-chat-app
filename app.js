const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { joinUser, getCurrentUser, leaveUser, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static middleware
app.use(express.static('public'));

const botName = 'ChatCord Bot';

// run when a client connects
io.on('connection', (socket) => {
    //console.log('new web socket connection...');

    // join a room
    socket.on('joinRoom', ({ username, room }) => {

        const user = joinUser(socket.id, username, room);

        // user join the room
        socket.join(user.room);

         // welcome current user
        socket.emit('message', formatMessage(botName ,'Welcome to ChatCord!'));

        // broadcast everybody except current user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName ,`${user.username} has joined the chat!`));

        // send user and room info into sidebar
        io.to(user.room).emit('roomUsers', ({
            room: user.room,
            users: getRoomUsers(user.room)
        }));
    });

      // recieve the chatMessage into the server
      socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        
        io.to(user.room).emit('message', formatMessage(user.username, msg));
        });

    // the user disconnect from the chat
        socket.on('disconnect', () => {
            const user = leaveUser(socket.id);

            if(user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`)); 

                // send user and room info into sidebar
        io.to(user.room).emit('roomUsers', ({
            room: user.room,
            users: getRoomUsers(user.room)
        }));
            }
        
        });

    
   
});

// listen to requests
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});