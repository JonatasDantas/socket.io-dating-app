const registerForm = document.getElementById('register-form');
 
/** Tratando o evento de envio no formulário de cadastro.
 *  Nestas linhas, criamos o websocket cliente que se conecta com o servidor 
 *  e envia os dados de imagem, nome de usuário e descrição */
registerForm.addEventListener('submit', event => {
    event.preventDefault();
    socket = io();

    socket.on('connect', () => {
        console.log("connected socket");

        // Instanciando um leitor de arquivo, ao terminar de ler o arquivo chama a função "onload"
        const reader = new FileReader();
        reader.onload = function() {
            // Compactando o arquivo para base64, necessário para que caiba no buffer do websocket
            const base64 = this.result.replace(/.*base64,/, '');

            const form = {
                image: base64,
                username: document.getElementById("username").value,
                description: document.getElementById("description").value,
            }

            // Emite uma mensagem de registro, com todos os dados
            socket.emit('register', form);
        }

        reader.readAsDataURL(document.getElementById("image").files[0]);
    });

    // Quando registrado, redireciona para a pagina main.html
    socket.on('register-successfully', (id) => {
        window.location.href += `main.html?userId=${id}`;
    })
});