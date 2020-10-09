const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', event => {
    event.preventDefault();
    socket = io();

    socket.on('connect', () => {
        console.log("connected socket");

        const reader = new FileReader();
        reader.onload = function() {
            const base64 = this.result.replace(/.*base64,/, '');
            const form = {
                image: base64,
                username: document.getElementById("username").nodeValue,
                description: document.getElementById("description").nodeValue,
            }

            socket.emit('register', form);
        }

        reader.readAsDataURL(document.getElementById("image").files[0]);
    });

    socket.on('register-successfully', (id) => {
        window.location.href += `main.html?userId=${id}`;
    })
});