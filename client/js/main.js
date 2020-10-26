// Criando websocket e conectando com servidor
socket = io();

// Declarando os elementos de tela que serão manipulados por Javascript
const cardName = document.getElementById("card-title");
const cardDescription = document.getElementById("card-text");
const cardImage = document.getElementById("card-img-top");
const recuseButton = document.getElementById("recuse");
const likeButton = document.getElementById("like");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("message-form");
const backButton = document.getElementById("back-discovery");

// Variáveis auxiliares na lógica
var userId;
var users = [];
var likedUsers = [];
var messages = {};
var chatUser;

// Criando eventos para os elementos de tela - Cliques e envio de formulário
recuseButton.addEventListener('click', showNextUser);
likeButton.addEventListener('click', likeUser);
backButton.addEventListener('click', renderDiscovery);
chatForm.addEventListener('submit', submitChatMessage)

// Evento de conexão com o websocket, recebe o id do usuário criado e pede os dados dele
socket.on("connect", () => {
    console.log("se conectou com o websocket!");

    const { userId } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    // Utilizando websockets de uma maneira parecida com uma requisição GET no HTTP, na qual retornará um response
    socket.emit("getUserData", userId);
});

// Response da requisição "getUserData", simulando o funcionamento de uma requisição GET
// Recebe os dados, descompacta foto em base64 e altera a tela para renderizar os dados do usuário
// Baseado nessa dúvida do stackoverflow: https://stackoverflow.com/questions/59478402/how-do-i-send-image-to-server-via-socket-io
socket.on("getUserDataResponse", (data) => {
    document.getElementById("user-image").src = `data:image/jpg;base64,${data.image}`;
    document.getElementById("user-name").innerHTML = `Olá, ${data.username}`;
    userId = data.id;

    // Recebe uma lista de usuários online, que são possíveis matches e renderiza o primeiro em tela para like/dislike
    if (data.listUsers.length > 0) {
        users.push(...data.listUsers);

        renderUser(users[0]);
    }

    console.log(users, "lista de usuários online");
});

// Evento de um novo usuário se conectando, recebe os dados dele e insere na lista de usuários online
// Caso não exista nenhum usuário para dar like/dislike, renderiza esse em tela
socket.on("newUser", (data) => {
    console.log("novo usuário se conectou: ", data);
    users.push(data);

    if (users.length == 1) {
        renderUser(data);
    }
});

// Evento de novo Match! cria uma linha na aba de mensagens para que possa ser iniciado o chat com esse usuário
socket.on("newMatch", (userId) => {
    console.log("novo match!!", likedUsers.find(user => user.id == userId));
    const user = likedUsers.find(user => user.id == userId);

    // Instancia array de mensagens entre usuários
    messages[userId] = [];

    // Renderiza a mensagem
    renderMessage(user.id, user.image, "Vocês deram um novo Match! Clique para conversar");
})

// Evento de recepção de nova mensagem de algum usuário
socket.on("newMessage", (message) => {
    console.log("nova mensagem: ", message);

    const data = {
        time: message.time,
        text: message.text,
        username: likedUsers.find(user => user.id == message.origin).username
    };

    // Adiciona dados no array de mensagens com o usuário
    messages[message.origin].push(data);

    // Renderiza a mensagem na aba "mensagens"
    document.getElementById(`message-text-${message.origin}`).innerText = `${data.username}: ${data.text}`;

    // Caso o chat esteja aberto com o usuário que mandou essa mensagem, renderiza no chat
    if (message.origin == chatUser.id) {
        outputMessage(data);
    }
})

// Função que renderiza um usuário na aba de "descoberta", na ação de dislike essa função é chamada
function showNextUser() {
    users.splice(0, 1);

    // Renderiza o próximo user, caso não exista nenhum renderiza um cartão genérico
    if (users.length > 0) {
        renderUser(users[0]);
    } else {
        renderGenericCard();
    }
}

// Função de like em um usuário
function likeUser() {
    if (users[0]) {
        likedUsers.push(users[0]);
    
        // Emite uma mensagem para o websocket servidor informando o like
        socket.emit("likeUser", {
            currentUser: userId,
            likedUser: users[0].id
        });
    
        // Mostra o próximo usuário
        showNextUser();
    }
}

// Renderiza um usuário no HTML de descoberta
function renderUser(user) {
    cardName.innerHTML = user.username;
    cardDescription.innerHTML = user.description;
    cardImage.src = `data:image/jpg;base64,${user.image}`;
}

// Renderiza uma imagem genérica no HTML de descoberta
function renderGenericCard() {
    cardName.innerHTML = "Aguardando novos usuários";
    cardDescription.innerHTML = "Quando um novo usuário entrar, aparecerá para você";
    cardImage.src = `img/aguardando-usuarios.png`;
}

// Renderiza uma mensagem na aba "mensagens" do HTML
function renderMessage(id, image, text) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.addEventListener('click', () => renderChat(id))

    const img = document.createElement("img");
    img.classList.add("messsage-user-image");
    img.src = `data:image/jpg;base64,${image}`;
    div.appendChild(img);

    const span = document.createElement("span");
    span.classList.add("message-text");
    span.id = `message-text-${id}`
    span.innerText = text;
    div.appendChild(span);

    document.querySelector(".messages-container").appendChild(div);
}

// Abre o chat com algum usuário
function renderChat(userId) {
    chatUser = likedUsers.find(user => user.id == userId);

    document.getElementById("chat-title").innerHTML = `<i class="fas fa-smile"></i> Chat com ${chatUser.username}`
    document.getElementById("discover").classList.add("hide");
    document.getElementById("chat").classList.add("show");
    clearChatMessages();

    for (let message of messages[userId]) {
        outputMessage(message);
    }
}

// Renderiza a aba de descoberta
function renderDiscovery() {
    document.getElementById("chat").classList.remove("show");
    document.getElementById("discover").classList.remove("hide");
    clearChatMessages();
}

// Limpa o chat
function clearChatMessages() {
    while (chatMessages.lastElementChild) {
        chatMessages.removeChild(chatMessages.lastElementChild)
    }
}

// Evento que envia uma mensagem para o usuário no chat
function submitChatMessage(e) {
    e.preventDefault();

    // Cria objeto de mensagem
    const message = {
        time: new Date().toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric', hour12: true }),
        text: document.getElementById("msg").value
    }

    // Adiciona no array de mensagem e emite para o servidor uma nova mensagem
    messages[chatUser.id].push({...message, username: "Você"});
    socket.emit("sendMessage", {...message, origin: userId, destiny: chatUser.id});

    // Escreve mensagens em tela
    document.getElementById(`message-text-${chatUser.id}`).innerText = `Você: ${message.text}`;
    outputMessage({...message, username: "Você"});

    // Limpa o input de text
    document.getElementById("msg").value = "";

    // Scroll para baixo
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função que escreve mensagens na aba "chat" do HTML
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span> ${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}