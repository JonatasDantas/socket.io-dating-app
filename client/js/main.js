socket = io();

const userImage = document.getElementById("user-image");
const userName = document.getElementById("user-name");
const cardName = document.getElementById("card-title");
const cardDescription = document.getElementById("card-text");
const cardImage = document.getElementById("card-img-top");
const recuseButton = document.getElementById("recuse");
const likeButton = document.getElementById("like");

const chatTitle = document.getElementById("chat-title");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("message-form");
const backButton = document.getElementById("back-discovery");

var userId;
var users = [];
var likedUsers = [];
var messages = {};
var chatUser;

recuseButton.addEventListener('click', showNextUser);
likeButton.addEventListener('click', likeUser);
backButton.addEventListener('click', renderDiscovery);
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = {
        time: new Date().toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric', hour12: true }),
        text: document.getElementById("msg").value
    }

    messages[chatUser.id].push({...message, username: "Você"});
    socket.emit("sendMessage", {...message, origin: userId, destiny: chatUser.id});

    // Escreve mensagens em tela
    document.getElementById(`message-text-${chatUser.id}`).innerText = `Você: ${message.text}`;
    outputMessage({...message, username: "Você"});

    // Limpa o input de text
    document.getElementById("msg").value = "";

    // Scroll para baixo
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on("connect", () => {
    console.log("connected!");

    const { userId } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    socket.emit("getUserData", userId);
});

socket.on("getUserDataResponse", (data) => {
    userImage.src = `data:image/jpg;base64,${data.image}`;
    userName.innerHTML = `Olá, ${data.username}`;
    userId = data.id;

    if (data.listUsers.length > 0) {
        users.push(...data.listUsers);

        renderUser(users[0]);
    }

    console.log(users, "list users online");
});

socket.on("newUser", (data) => {
    console.log("new user broadcasted", data);
    users.push(data);

    if (users.length == 1) {
        renderUser(data);
    }
});

socket.on("newMatch", (userId) => {
    console.log("new match!!", likedUsers.find(user => user.id == userId));
    const user = likedUsers.find(user => user.id == userId);
    messages[userId] = [];

    renderMessage(user.id, user.image, "Vocês deram um novo Match!");
})

socket.on("newMessage", (message) => {
    console.log("new message: ", message);

    const data = {
        time: message.time,
        text: message.text,
        username: likedUsers.find(user => user.id == message.origin).username
    };

    messages[message.origin].push(data);
    document.getElementById(`message-text-${message.origin}`).innerText = `${data.username}: ${data.text}`;
    outputMessage(data);
})

function showNextUser() {
    users.splice(0, 1);

    if (users.length > 0) {
        renderUser(users[0]);
    } else {
        renderGenericCard();
    }
}

function likeUser() {
    likedUsers.push(users[0]);

    socket.emit("likeUser", {
        currentUser: userId,
        likedUser: users[0].id
    });

    showNextUser();
}

function renderUser(user) {
    cardName.innerHTML = user.username;
    cardDescription.innerHTML = user.description;
    cardImage.src = `data:image/jpg;base64,${user.image}`;
}

function renderGenericCard() {
    cardName.innerHTML = "Aguardando novos usuários";
    cardDescription.innerHTML = "Quando um novo usuário entrar, aparecerá para você";
    cardImage.src = `img/aguardando-usuarios.png`;
}

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

function renderChat(userId) {
    chatUser = likedUsers.find(user => user.id == userId);

    chatTitle.innerHTML = `<i class="fas fa-smile"></i> Chat com ${chatUser.username}`
    document.getElementById("discover").classList.add("hide");
    document.getElementById("chat").classList.add("show");
    clearChatMessages();

    for (let message of messages[userId]) {
        outputMessage(message);
    }
}

function renderDiscovery() {
    document.getElementById("chat").classList.remove("show");
    document.getElementById("discover").classList.remove("hide");
    clearChatMessages();
}

function clearChatMessages() {
    while (chatMessages.lastElementChild) {
        chatMessages.removeChild(chatMessages.lastElementChild)
    }
}

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