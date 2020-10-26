// Bibliotecas adicionais, PATH para ler o caminho da máquina e FS para ler arquivos (imagem)
const fs = require('fs');
const path = require('path');

const users = [];

// Classe de usuário
class User {

    // Construtor responsável por criar o usuário e armazenar seus dados
    constructor(userData, id) {
        this.id = id;
        this.username = userData.username;
        this.description = userData.description;
        this.likes = [];

        // Aqui é onde a imagem é salva, cria um buffer que converte a imagem de base64 (usado para ocupar menos espaço) para .png
        // Baseado nessa dúvida do stackoverflow: https://stackoverflow.com/questions/59478402/how-do-i-send-image-to-server-via-socket-io
        const buffer = Buffer.from(userData.image, 'base64');

        // salva a imagem na pasta assets/img do projeto
        fs.writeFile(
            path.join(__dirname, `assets/img/${this.id}.png`),
            buffer,
            () => console.log("image saved"),
        );

        this.image = buffer;
    }

    getId() {
        return this.id;
    }

    printValues() {
        console.log({
            "id": this.id,
            "username": this.username,
            "description": this.description,
            "likes": this.likes
        });
    }
}

// Funções auxiliares

// Add usuário no array de usuários
function userJoin(user) {
    users.push(user);
    return user;
}

// Get usuário
function getUser(id) {
    return users.find(user => user.id == id);
}

// Get nos usuários ativos, que são possível matches, excluindo o usuário que solicitou
function getAbleUsers(userId) {
    return users.filter(user => {
        user.image = user.image.toString('base64');

        if (user.id !== userId) {
            return true;
        }

        return false;
    });
}

// Função que cria o link - de um usuário para outro
function setupLikes(userId, userLikedId) {
    const user = users.find(user => user.id == userId);
    const userLiked = users.find(user => user.id == userLikedId);

    // Adiciona o id no array de likes
    user.likes.push(userLikedId);

    // Caso os dois usuários se gostem, retorna true
    return userLiked.likes.includes(userId);
}

// Estrutura do NodeJS para exportar as funções
module.exports = {
    User,
    userJoin,
    getUser,
    getAbleUsers,
    setupLikes
};
