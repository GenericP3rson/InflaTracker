const { MongoClient } = require('mongodb');
const fs = require('fs');
const crypto = require('crypto');


class DataBaseWork {

    async databaseWork(data) {
        this.client = new MongoClient(data); // Creates client
        try {
            await this.client.connect(); // Connects to client
            this.addPassword(this.client, "password");
        } catch (err) {
            console.error(err);
        } finally {
            await this.client.close(); // Closes client connection
        }
    }

    async addPassword(client, password) {
        const hash = crypto.createHash('sha1');
        console.log(hash.update(password).digest('base64'));
    }

    async allow(client, hash, password) {
        const hash = crypto.createHash('sha1');
        return 
    }
    
}

fs.readFile('clienturl.txt', 'utf8', (err, data) => {
    if (err) {
        return console.error(err);
    } else {
        const url = data; // For safety's sake, our user credentials is on a separate doc
        let dbwork = new DataBaseWork();
        dbwork.databaseWork(url).catch(console.error);
        dbwork.addPassword("Hello");
    }
});
