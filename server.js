// Bibliotecas adicionais usadas

// Path é nativo no NodeJS, serve para pegar o caminho do arquivo na máquina
const path = require('path');

// Biblioteca HTTP foi usada para instanciar o servidor de websockets, porém não estamos utilizando nenhum método HTTP, somente Websockets
const http = require('http');

// Express é o framework para NodeJS que nos permite lidar com diferentes arquivos e renderizar HTML estático
const express = require('express');

// SocketIO é a biblioteca responsável por gerenciar os websockets
const socketio = require('socket.io');

// Métodos auxiliares para lidar com usuários
const {
    User,
    userJoin,
    getUser,
    getAbleUsers,
    setupLikes
} = require('./users');

// Criando um websocket servidor e deixando-o pronto para uso
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Define a pasta "client" que contém os HTMLS e JS responsáveis pelo Front-end (tela) no projeto
app.use(express.static(path.join(__dirname, "client")));

// Eventos de conexão com o Websocket, servidor tanto ouve quanto comunica
io.on('connection', socket => {
    console.log("Alguém se conectou");

    // Id de conexão, que será usado como Id do usuário
    const id = socket.id;

    // Evento de registro, instancia um novo usuário e salva seus dados no array de users
    socket.on('register', async (data) => {
        var user = new User(data, id);
        userJoin(user);

        // Retorno dizendo que registrou com sucesso
        socket.emit('register-successfully', user.getId());

        // Emite uma mensagem para todos os outros usuários, informando que um novo usuário se conectou no sistema
        socket.broadcast.emit('newUser', {
            ...user,
            image: user.image.toString('base64'),
        });
    });

    // Evento no websocket que solicita os dados do usuário
    socket.on('getUserData', (userId) => {
        const user = getUser(userId);

        socket.join(user.getId());

        // Envia os dados do usuário, compactando a sua imagem em base64, para caber no buffer do websocket
        socket.emit('getUserDataResponse', {
            ...user,
            image: user.image.toString('base64'),
            listUsers: getAbleUsers(userId),
        });
    });

    // Evento de like em um usuário, cria uma relação entre os dois usuários, e caso os dois tenham dado like um ao outro, cria um Match
    socket.on('likeUser', (likeData) => {

        // Essa função retorna true caso os dois tenham dado like
        if (setupLikes(likeData.currentUser, likeData.likedUser)) {
            console.log("novo Match!!", likeData);

            // Emite um match para os usuários
            socket.emit("newMatch", likeData.likedUser);
            io.to(likeData.likedUser).emit("newMatch", likeData.currentUser);
        }
    })

    // Evento de envio de mensagem de um usuário para o outro, apenas repassa a mensagem para o websocket de destino
    socket.on('sendMessage', (message) => {
        io.to(message.destiny).emit("newMessage", {...message})
    });
})

// Inicia o websocket do servidor, ouvindo a porta 8080
server.listen(8080, () => {
    console.log("server is listening on port 8080");
})