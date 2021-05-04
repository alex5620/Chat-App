const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./messages');
fs = require('fs');
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
            
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

app.post('/login', (req, res) => {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        const responseList = body.split('\r\n');
        const username = responseList[3];
        const password = responseList[7];
        if(checkIfUserExists(username, password))
        {
            res.redirect('html/chat.html');
        }
        else
        {
            res.status(401).json({
                Success: 0, 
                Message: 'Invalid Credentials'
            });
        }
    });
});

app.post('/register', (req, res) => {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        const responseList = body.split('\r\n');
        const username = responseList[3];
        const password = responseList[7];
        const password2 = responseList[11];
        if(password != password2)
        {
            res.status(401).json({
                Success: 0, 
                Message: 'Invalid Credentials'
            });
        }
        else if(password.length < 6 || username.length < 6)
        {
            res.status(422).json({
                Success: 0, 
                Message: 'Unprocessable Entity'
            });
        }
        else if(checkIfUserExistsByUsername(username))
        {
            res.status(409).json({
                Success: 0, 
                Message: 'Resource already exists'
            });
        }
        else
        {
            const data = fs.readFileSync('users.json', 'utf8');
            const users = JSON.parse(data);
            users.push({username: username, password: password });
            fs.writeFileSync('users.json', JSON.stringify(users), { encoding: "utf8"}); 
            res.status(200).json({
                Success: 0, 
                Message: 'OK'
            });
        }
    });
});

const port = 7878; 
server.listen(port, () => console.log(`The server is running at address http://localhost: ${port}`));

function checkIfUserExistsByUsername(username)
{
    const data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    for(let i=0;i<users.length;++i)
    {
        if(users[i].username == username)
        {
            return true;
        }
    }
    return false;
}

function checkIfUserExists(username, password)
{
    const data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    for(let i=0;i<users.length;++i)
    {
        if(users[i].username == username && users[i].password == password)
        {
            return true;
        }
    }
    return false;
}