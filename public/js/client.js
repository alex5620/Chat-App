const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementsByClassName('chat-messages')[0];
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const onlineUsers = document.getElementById('online-users');

myStorage = window.sessionStorage;
const username = sessionStorage.getItem('username');
const room = sessionStorage.getItem('room');
let isAdmin = false

const socket = io();
socket.emit('joinRoom', { username, room });

socket.on('admin', response => 
{
    isAdmin = response;
    if(isAdmin)
    {
        document.getElementById("modalButton").style.display = "block";
    }
});

socket.on('roomUsers', ({ room, users }) => {
    if(shouldDisconnect(users))
    {
        socket.emit('forceDisconnect');
        window.location.href = '../index.html';
        alert('You have been kicked out.');
    }
    outputRoomName(room);
    outputUsers(users);
    if(isAdmin)
    {
        updateOnlineUsers(users);
    }
});

socket.on('usersResult', users => {
    updateOnlineUsers(users);
})

socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    // send the message to the server
    socket.emit('chatMessage', msg);   
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus(); 
});

function outputMessage(message)
{
    const div = document.createElement('div');
    div.classList.add('message');
    let messageUsername = message.username;
    let imageElement = ''
    if(messageUsername === username)
    {
        messageUsername = 'You';
    }
    else if(messageUsername === 'ChitChat Bot')
    {
        imageElement = '<img id="bot-img" src ="../resources/bot.png" alt="No image found." width=16 height=16">'    
    }
    let color='';
    if(message.isAdmin && messageUsername != 'You')
    {
        messageUsername += '-ADMIN';
        color = 'style=color:red;';
    }
    div.innerHTML = `<p class="user" ${color}>${messageUsername}&nbsp;
    ${imageElement}
    &nbsp;<span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.getElementsByClassName('chat-messages')[0].appendChild(div);
}

function outputRoomName(room)
{
    roomName.innerText = room;
}

function outputUsers(users)
{
    userList.innerHTML = '';
    userList.innerHTML += `<li>${username}(you)</li>`;
    for(user in users)
    {
        if(users[user].username !== username)
        {
            userList.innerHTML += `<li>${users[user].username}</li>`;
        }
    }
}

function updateOnlineUsers(users)
{
    document.getElementById('online-users-text').innerHTML = 'Online users: ' + (users.length-1); 
    onlineUsers.innerHTML = '';
    for(user in users)
    {
        if(users[user].username !== username)
        {
            let content;
            if(users[user].isAdmin == true)
            {
                content = '-ADMIN</li>';
            }
            else
            {
                content = `<button class="btn" id="kick-button" onclick="kickoutUser('${username}','${users[user].username}')" >Kick out</button></li>`;                
            }
            onlineUsers.innerHTML += `<li>${users[user].username}${content}`;
        }
    }
}

function kickoutUser(admin, user)
{
    socket.emit('kickout', {admin, user});

}

function shouldDisconnect(users)
{
    for(user in users)
    {
        if(users[user].username === username)
        {
            return false;
        }
    }
    return true;
}