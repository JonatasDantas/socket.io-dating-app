const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
    User,
    userJoin,
    getUser,
    getAbleUsers,
    setupLikes
} = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "client")));

io.on('connection', socket => {
    console.log("someone connected");
    const id = socket.id;

    socket.on('register', async (data) => {
        var user = new User(data, id);
        userJoin(user);

        socket.emit('register-successfully', user.getId());

        socket.broadcast.emit('newUser', {
            ...user,
            image: user.image.toString('base64'),
        });
    });

    socket.on('getUserData', (userId) => {
        const user = getUser(userId);

        socket.join(user.getId());

        socket.emit('getUserDataResponse', {
            ...user,
            image: user.image.toString('base64'),
            listUsers: getAbleUsers(userId),
        });
    });

    socket.on('likeUser', (likeData) => {
        if (setupLikes(likeData.currentUser, likeData.likedUser)) {
            console.log("new Match!!", likeData);
            socket.emit("newMatch", likeData.likedUser);
            io.to(likeData.likedUser).emit("newMatch", likeData.currentUser);
        }
    })
})

server.listen(8080, () => {
    console.log("server is listening on port 8080");
})