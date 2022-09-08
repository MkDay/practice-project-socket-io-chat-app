const chatForm = document.querySelector('#chat-form');
const userList = document.querySelector('#users');
const roomName = document.querySelector('#room-name');

// get username & roo from query string using qs library

const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//console.log(username, room);

// join a user a room
socket.emit('joinRoom', { username, room });

// room users
socket.on('roomUsers', ({room, users }) => {
    outputRoom(room);
    outputUsers(users);
});

// catch messages from the server
socket.on('message', message => {
    //console.log(message);
    outputMessage(message);

    // scroll down to the recent message --> can't fix it 
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = document.querySelector('#chat-message').value;

    // console.log(msg);

    // send the chatMessage to the server
    socket.emit('chatMessage', msg);

    // refresh input field and focus
    document.querySelector('#chat-message').value = '';
    document.querySelector('#chat-message').focus();
});

// function to recieve output messages from the server 

const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.inbox').appendChild(div);
};

// add room name to DOM
const outputRoom = (room) => {
    roomName.innerText = room;
};

// add users in the room into DOM
const outputUsers = (users) => {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
};