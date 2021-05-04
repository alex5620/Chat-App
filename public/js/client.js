const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementsByClassName('chat-messages')[0];
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

myStorage = window.sessionStorage;
const username = sessionStorage.getItem('username');
const room = sessionStorage.getItem('room');

const socket = io();
socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

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
    div.innerHTML = `<p class="user">${messageUsername}&nbsp;
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