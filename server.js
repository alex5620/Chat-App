const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./messages');
fs = require('fs');
const { removeUser, userJoin, getCurrentUser, userLeave, getRoomUsers, checkIfUserIsLoggedInRoom } = require('./users');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        let isAdmin = isUserAdmin(username, room);
        socket.emit('admin', isAdmin);
        const user = userJoin(socket.id, username, room, isAdmin);
        socket.join(user.room); 
        // sends the message to the client that has connected
        socket.emit('message', formatMessage('ChitChat Bot','Welcome to ChitChat!', false));
        // sends the message to everyone excepting the user that is connecting
        socket.broadcast.to(user.room).emit('message',  formatMessage('ChitChat Bot',`${username} has joined the chat.`, false));        

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',  formatMessage(user.username, msg, user.isAdmin));
    });

    socket.on('users', msg => {
        // get list of users from the room and send it to the client
        socket.emit('usersResult', getRoomUsers(msg));
    })

    socket.on('kickout', ({admin, user}) => {
        const kickedUser = removeUser(user);
        io.to(kickedUser.room).emit('message', formatMessage('ChitChat Bot',`${user} has been kicked out by admin ${admin}.`, false));
        io.to(kickedUser.room).emit('roomUsers', {
            room: kickedUser.room,
            users: getRoomUsers(kickedUser.room)
        });
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user)
        {
            // sends the message to everyone 
            io.to(user.room).emit('message', formatMessage('ChitChat Bot',`${user.username} has left the chat.`, false));
            
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    socket.on('forceDisconnect', () => {
        socket.disconnect();
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
        const room = responseList[11];
        if(checkIfUserIsBanned(username, room))
        {
            res.status(403).json({
                Success: 0, 
                Message: 'Forbidden'
            });
        }
        else if(checkIfUserIsLoggedInRoom(username, room))
        {
            res.status(202).json({
                Success: 0, 
                Message: 'Accepted'
            });
        }
        else if(checkIfUserExists(username, password))
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

function checkIfUserIsBanned(username, room)
{
    const data = fs.readFileSync('banned-users.json', 'utf8');
    const bannedUsers = JSON.parse(data);
    let time = new Date().getTime();
    for(let i=0;i<bannedUsers.length;++i)
    {
        if(bannedUsers[i].username == username && (time - JSON.parse(bannedUsers[i].time) < 3600000)
            && bannedUsers[i].room == room)
        {
            return true;
        }
    }
    return false;
}

function isUserAdmin(username, room)
{
    const data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    for(let i=0;i<users.length;++i)
    {
        if(users[i].username == username && users[i].admin != undefined)
        {
            for(let j=0;j<users[i].admin.length;++j)
            {
                if(room == users[i].admin[j])
                {
                    return true;
                }
            }
        }
    }
    return false;
}