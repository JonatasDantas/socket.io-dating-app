socket = io();

socket.on("connect", () => {
    console.log("connected!");

    const { userId } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    socket.emit("getUserData", userId);
});

socket.on("getUserDataResponse", (data) => {
    const userImage = document.getElementById("user-image");
    const userName = document.getElementById("user-name");

    userImage.src = `data:image/jpg;base64,${data.image}`;
    userName.innerHTML = `Olá, ${data.username}`;
});