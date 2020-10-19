socket = io();

const userImage = document.getElementById("user-image");
const userName = document.getElementById("user-name");
const cardName = document.getElementById("card-title");
const cardDescription = document.getElementById("card-text");
const cardImage = document.getElementById("card-img-top");
const recuseButton = document.getElementById("recuse");
const likeButton = document.getElementById("like");

var userId;
var users = [];
var likedUsers = [];

recuseButton.addEventListener('click', showNextUser);
likeButton.addEventListener('click', likeUser);

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

    renderMessage(user.id, user.image, "Vocês deram um novo Match!");
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