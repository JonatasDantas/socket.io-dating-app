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

module.exports = {
    User,
    userJoin
};
