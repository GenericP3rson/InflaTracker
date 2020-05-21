const { MongoClient } = require('mongodb');
const fs = require('fs');
const sha1 = require('sha1');
// const crypto = require('sha1');

class DataBaseWork {
    /**
     * Sets up client. 
     * @param {String} data 
     */
    constructor(url) {
        this.client = new MongoClient(url); // Creates client
    }

    /**
     * Hashes the password
     * @param {String} password 
     */
    hashPassword(password) {
        // console.log(hash.update(password).digest('base64'));
        return sha1(password);
    }

    /**
     * Gets a user from the DB
     * @param {String} user 
     */
    async getUser(user) {
        let dat = null;
        try {
            await this.client.connect();
            let dbo = this.client.db("InflaTracker");
            dbo.collection("InflaTracker").findOne({ name: user }, (err, data) => {
                if (err) throw err;
                dat = data;
            });
        } catch (err) {
            console.error(err);
        } finally {
            await this.client.close();
            return dat;
        }
    }

    /**
     * Verifies whether the user is in the DB
     * @param {String} user 
     */
    userExists(user) {
        let val = this.getUser(user).catch(console.error).then(token => { return token });
        val.then((data) => {
            console.log(data);
            console.log(data!=null);
            return data != null;
        })
    }

    /**
     * Verifies whether the password is correct
     * @param {String} user 
     * @param {String} password 
     */
    authenticate(user, password) {
        let val = this.getUser(user).catch(console.error).then(token => { return token });
        val.then((data) => {
            if (data) {
                console.log(data);
                console.log(data.password == sha1(password));
                return data.password == sha1(password);
            } else console.error("USER DOES NOT EXIST");
        })
    }

    /**
     * Adds a new user to our collection.
     * @param {String} user 
     * @param {String} password 
     */
    async addUser(user, password) {
        try {
            await this.client.connect(); // Connects to client
            // let val = this.getUser(user).catch(console.error).then(token => { return token });
            // val.then((data) => {
            //     if (!data) {
            let dbo = this.client.db("InflaTracker");
            let data = { name: user, password: this.hashPassword(password) };
            dbo.collection("InflaTracker").insertOne(data, function (err, res) {
                if (err) throw err;
                console.log("User added");
            });
                // } else console.error("USER DOES NOT EXIST");
            // })
        } catch (err) {
            console.error(err);
        } finally {
            await this.client.close(); // Closes client connection
        }
    }

    async changeCredentials(oldUser, newUser, newPass) {
        try {
            await this.client.connect(); // Connects to client
            // let val = this.getUser(user).catch(console.error).then(token => { return token });
            // val.then((data) => {
            //     if (!data) {
            let dbo = this.client.db("InflaTracker");
            let myquery = { name: oldUser };
            let newvalues = { $set: { name: newUser, password: this.hashPassword(newPass) } };
            dbo.collection("InflaTracker").updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
                console.log("1 user updated");
                // db.close();
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
        let dbwork = new DataBaseWork(url);
        console.log(dbwork.changeCredentials("Name2", "Name2", "Hello"));
    }
});
