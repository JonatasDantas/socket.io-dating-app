socket = io();

const userImage = document.getElementById("user-image");
const userName = document.getElementById("user-name");
const cardName = document.getElementById("card-title");
const cardDescription = document.getElementById("card-text");
const cardImage = document.getElementById("card-img-top");
const recuseButton = document.getElementById("recuse");
const likeButton = document.getElementById("like");

var users = [];

recuseButton.addEventListener('click', recuseUser);
recuseButton.addEventListener('click', recuseUser);

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

    if (data.listUsers.length > 0) {
        users.push(...data.listUsers);

        renderUser(users[0]);
    }

    console.log(users, "list users online");
});

socket.on("new-user", (data) => {
    console.log("new user broadcasted", data);
    users.push(data);

    if (users.length == 1) {
        renderUser(data);
    }
});

function recuseUser() {
    users.splice(0, 1);

    if (users.length > 0) {
        renderUser(users[0]);
    } else {
        renderGenericCard();
    }
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