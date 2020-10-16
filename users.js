const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const users = [];

class User {
    constructor(userData) {
        this.id = uuidv4();
        this.username = userData.username;
        this.description = userData.description;

        const buffer = Buffer.from(userData.image, 'base64');
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
        });
    }
}

function userJoin(user) {
    users.push(user);
    return user;
}

function getUser(id) {
    return users.find(user => user.id == id);
}

function getAbleUsers(userId) {
    return users.filter(user => {
        user.image = user.image.toString('base64');

        if (user.id !== userId) {
            return true;
        }

        return false;
    });
}

module.exports = {
    User,
    userJoin,
    getUser,
    getAbleUsers
};
