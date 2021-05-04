const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room); 
        // sends the message to the client that has connected
        socket.emit('message', formatMessage('ChitChat Bot','Welcome to ChitChat!'));
        // sends the message to everyone excepting the user that is connecting
        socket.broadcast.to(user.room).emit('message',  formatMessage('ChitChat Bot',`${username} has joined the chat.`));        

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        // here I could send the message just to the other users
        // and in the client page I could put just you on the sender's name
        io.to(user.room).emit('message',  formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user)
        {
            // sends the message to everyone 
            io.to(user.room).emit('message', formatMessage('ChitChat Bot',`${user.username} has left the chat.`));
            
            io.to(user.room).emit('roomUsers'), {
                room: user.room,
                users: getRoomUsers(user.room)
            };
        }
    });
});

const port = 7878; 
server.listen(port, () => console.log(`The server is running at address http://localhost: ${port}`));
