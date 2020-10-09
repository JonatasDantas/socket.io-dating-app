const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
    User,
    userJoin
} = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "client")));

io.on('connection', socket => {
    console.log("someone connected");

    socket.on('register', async (data) => {
        var user = new User(data);
        userJoin(user);

        socket.emit('register-successfully', user.getId());        
    })
})

server.listen(8080, () => {
    console.log("server is listening on port 8080");
})