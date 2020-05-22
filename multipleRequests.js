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
        this.url = url;
        // this.client = new MongoClient(this.url); // Creates client
        // this.dbo = this.client.db("InflaTracker");

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
        // MongoClient.connect(this.url, function (err, db) {
        //     if (err) throw err;
        //     let dbo = db.db("InflaTracker");
        //     dbo.collection("InflaTracker").findOne({ name: user }, (err, data) => {
        //         if (err) throw err;
        //         // dat = data;
        //         db.close();
        //         return data;
        //     });
        // });
        // let dat = null;
    //     try {
    //         await this.client.connect();
    //         let dbo = this.client.db("InflaTracker");
    //         dbo.collection("InflaTracker").findOne({ name: user }, (err, data) => {
    //             if (err) throw err;
    //             dat = data;
    //         });
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         // await this.client.close();
    //         return dat;
    //     }
    }

    /**
     * Verifies whether the password is correct
     * @param {String} user 
     * @param {String} password 
     */
    authenticate(user, password) {
        let val1 = this.getUser(user).catch(console.error);
        // console.log(val1)
        let val = this.getUser(user).catch(console.error).then(token => { return token });
        val.then((data) => {
            console.log(data);
            if (data) {
                console.log(data);
                console.log(data.password == sha1(password));
                return data.password == sha1(password);
            } else throw "USER DOES NOT EXIST";
        })

        // // await this.client.connect();
        // // let dbo = this.client.db("InflaTracker");
        // // const search = dbo.collection("InflaTracker").findOne({ name: user }, (err, d) => {
        // //     if (err) throw err;
        // //     if (!d) throw "USER DOES NOT EXIST";
        // //     else return d;
        // // });

        // val.then((data) => {
        //     console.log(data);
        //     if (data) {
        //         console.log(data);
        //         console.log(data.password == sha1(password));
        //         return data.password == sha1(password);
        //     }
        // })
        // .catch((err) => {
        //     throw err;
        // });

    }

    /**
     * Adds a new user to our collection.
     * @param {String} user 
     * @param {String} password 
     */
    async addUser(user, password) {
        try {
            // await this.client.connect(); // Connects to client
            await this.client.connect();
            let dbo = this.client.db("InflaTracker");
            let data = { name: user, password: this.hashPassword(password) };
            // dbo.collection("InflaTracker").findOne({ name: user }, (err, d) => {
            //     if (err) throw err;
            //     if (d) {
            //         throw "USER ALREADY EXISTS";
            //     } else {
            //         dbo.collection("InflaTracker").insertOne(data, function (err, res) {
            //             if (err) throw err;
            //             console.log("1 document inserted");
            //         });
            //     }
            // });
            const search = dbo.collection("InflaTracker").findOne({name: user}, (err, d) => {
                if (err) throw err;
                if (d) throw "USER ALREADY EXISTS";
                // else return d;
            });
            const insert = dbo.collection("InflaTracker").insertOne(data, function (err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
            // await this.client.close(); // Closes client connection

            Promise
                .all([search, insert])
                .then((values) => {
                    return res.send({ success: true });
                })
                .catch((reason) => {
                    logger.error(`msg`, reason);
                    return res.status(400).send({ reason: 'unknown' });
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
        dbwork.authenticate("Name3", "Password");
        // dbwork.authenticate("Name3", "Password");
    }
});
