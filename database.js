// I'm going to mark this up as much as I can for future use.

const { MongoClient } = require('mongodb'); // DB
const fs = require('fs'); // FS
const sha1 = require('sha1'); // Encryption
// const crypto = require('sha1');

const DatabaseWork = {
    /**
    * Sets up client. 
    * @param {String} data 
    */
    init: async function (url) {
        this.client = new MongoClient(url, { useUnifiedTopology: true }); // Creates client
        await this.client.connect(); // Connects when initialised
    },
    /**
     * Hashes the password
     * @param {String} password 
     */
    hashPassword: function (password) {
        // console.log(hash.update(password).digest('base64'));
        return sha1(password); // Encrypts a password
    },
    /**
     * Gets a user from the DB
     * @param {String} user 
     */
    getUser: async function (user) {
        try {
            // await this.client.connect()
            let dbo = this.client.db("InflaTracker"), // FIX // Why did she write FIX?
            promi = new Promise((resolve, reject) => {
                    dbo.collection("InflaTracker").findOne({ username: user }, (err, data) => { // Searches for name
                    if (err) throw err;
                    resolve(data); // Resolves Promise
                });
            }),
            ans = await promi;
            return ans;
        } catch (err) {
            console.error(err);
        }
    },
    /**
     * Verifies whether the user is in the DB
     * @param {String} user 
     */
    userExists: function (user) {
        let val = this.getUser(user).catch(console.error).then(token => { return token }); // Search for user
        val.then((data) => {
            console.log(data);
            console.log(data != null); 
            return data != null; // false if null
        })
    },
    /**
     * Verifies whether the password is correct
     * @param {String} user 
     * @param {String} password 
     */
    authenticate: async function (user, password) {
        let val = new Promise((resolve, reject) => {
            this.getUser(user).catch(console.warn).then(token => {
                resolve(token); 
            });
        }),
        result = await val;
        if(!result) {
            // console.warn("USER DOESN'T EXIST");
            // Warning the user, even on the backend, makes it easier for hacker attacks.
            // Just having the data or false feels more secure.
            return false; 
        } else {
            return result.password == sha1(password) ? result : false; // Returns whether the password is fine
        }
    },
    /**
     * Adds a new user to our collection.
     * @param {String} user 
     * @param {String} password 
     */
    addUser: async function (user, password, name) { // NEEDS UPDATE
        try {
            let dbo = this.client.db("InflaTracker"); // Grab DB
            let data = { name: name, username: user, password: this.hashPassword(password) }; // We store the name and password
            dbo.collection("InflaTracker").insertOne(data, function (err, res) { // Basic Insert
                if (err) throw err;
                console.log("User added");
                return true; // Successful, I'm assuming.
            });
        } catch (err) {
            console.error(err);
            return false; // Why are we returning false? Just an error so dictate whether it's successful?
        } finally {
        }
    },
    /**
     * Changes an old user's username and password.
     * @param {String} oldUser
     * @param {String} newUser
     * @param {String} newPass
    */
    changeCredentials: async function (oldUser, newUser, newPass) {
        try {
            await this.client.connect((err) => {
                if (err) {
                    console.warn(err);
                    return false;
                }
                let dbo = this.client.db("InflaTracker"); // Connects
                let myquery = { username: oldUser }; // The query
                let newvalues = { $set: { username: newUser, password: this.hashPassword(newPass) } }; // Set for new values
                dbo.collection("InflaTracker").updateOne(myquery, newvalues, function (err, res) { // Updates
                    if (err) {
                        console.warn(err);
                        return false; // False if problem
                    }
                    console.log("1 user updated");
                    return true; // True if good
                    // db.close();
                });
            }); // Connects to client
        } catch (err) {
            console.warn(err);
            return false;
        } finally {
            await this.client.close(); // Closes client connection
            return true;
        }
    }
}
module.exports = DatabaseWork