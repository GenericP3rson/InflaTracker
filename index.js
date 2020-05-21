const { MongoClient } = require('mongodb');
const fs = require('fs');
const sha1 = require('sha1');
// const crypto = require('sha1');


class DataBaseWork {
    /**
     * Sets up client. 
     * @param {String} data 
     */
    constructor(data) {
        this.client = new MongoClient(data); // Creates client
    }

    /**
     * Hashes the password
     * @param {String} password 
     */
    async hashPassword(password) {
        // console.log(hash.update(password).digest('base64'));
        return sha1(password);
    }

    /**
     * Verifies whether the password is correct
     * @param {MongoClient} client 
     * @param {String} hash 
     * @param {String} password 
     */
    async allow(user, password) {
        try {
            await this.client.connect();
            let dbo = this.client.db("InflaTracker");
            dbo.collection("InflaTracker").findOne({name: user}, (err, data) => {
                if (err) throw err;
                console.log(data);
                return data && data.password == this.hashPassword(password);
            });
        } catch (err) {
            console.error(err);
        } finally {
            await this.client.close();
        }
    }

    /**
     * Adds a new user to our collection.
     * @param {String} user 
     * @param {String} password 
     */
    async addUser(user, password) {
        try {
            await this.client.connect(); // Connects to client
            let dbo = this.client.db("InflaTracker");
            let pass = this.hashPassword(password);
            console.log(pass + "");
            let data = { name: user, password: pass };
            dbo.collection("InflaTracker").insertOne(data, function (err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
        } catch (err) {
            console.error(err);
        } finally {
            await this.client.close(); // Closes client connection
        }
    }

}

fs.readFile('clienturl.txt', 'utf8', (err, data) => {
    if (err) {
        return console.error(err);
    } else {
        const url = data; // For safety's sake, our user credentials is on a separate doc
        let dbwork = new DataBaseWork(url);;
        dbwork.allow("Name1", "Password").catch(console.error);
    }
});
