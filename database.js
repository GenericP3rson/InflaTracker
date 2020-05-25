const { MongoClient } = require('mongodb');
const fs = require('fs');
const sha1 = require('sha1');
// const crypto = require('sha1');

const DatabaseWork = {
    /**
    * Sets up client. 
    * @param {String} data 
    */
    init: async function (url) {
        this.client = new MongoClient(url, { useUnifiedTopology: true }); // Creates client
        await this.client.connect()
    },
    /**
     * Hashes the password
     * @param {String} password 
     */
    hashPassword: function (password) {
        // console.log(hash.update(password).digest('base64'));
        return sha1(password);
    },
    /**
     * Gets a user from the DB
     * @param {String} user 
     */
    getUser: async function (user) {
        try {
            // await this.client.connect()
            let dbo = this.client.db("InflaTracker"), // FIX
            promi = new Promise((resolve, reject) => {
                    dbo.collection("InflaTracker").findOne({ name: user }, (err, data) => {
                    if (err) throw err;
                    resolve(data)
                });
            }),
            ans = await promi
            return ans
        } catch (err) {
            console.error(err);
        }
    },
    /**
     * Verifies whether the user is in the DB
     * @param {String} user 
     */
    userExists: function (user) {
        let val = this.getUser(user).catch(console.error).then(token => { return token });
        val.then((data) => {
            console.log(data);
            console.log(data != null);
            return data != null;
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
                resolve(token)
            });
        }),
        result = await val
        // val.then((data) => {
        //     if (data) {
        //         console.log(data);
        //         console.log(data.password == sha1(password));
        //         return data.password == sha1(password);
        //     } else console.error("USER DOES NOT EXIST");
        // })
        if(!result) {
            // console.warn("USER DOESN'T EXIST")
            // await this.client.close()
            // Warning the user, even on the backend, makes it easier for hacker attacks.
            // Just having the data or false feels more secure.
            return false
        } else {
            // await this.client.close()
            return result.password == sha1(password) ? result : false
        }
    },
    /**
     * Adds a new user to our collection.
     * @param {String} user 
     * @param {String} password 
     */
    addUser: async function (user, password) {
        try {
            // await this.client.connect(); // Connects to client
            // let val = this.getUser(user).catch(console.error).then(token => { return token });
            // val.then((data) => {
            //     if (!data) {
            let dbo = this.client.db("InflaTracker");
            let data = { name: user, password: this.hashPassword(password) };
            dbo.collection("InflaTracker").insertOne(data, function (err, res) {
                if (err) throw err;
                console.log("User added");
                return true
            });
            // } else console.error("USER DOES NOT EXIST");
            // })
        } catch (err) {
            console.error(err);
            return false
        } finally {
            // await this.client.close(); // Closes client connection
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
                    console.warn(err)
                    return false
                }
                let dbo = this.client.db("InflaTracker");
                let myquery = { name: oldUser };
                let newvalues = { $set: { name: newUser, password: this.hashPassword(newPass) } };
                dbo.collection("InflaTracker").updateOne(myquery, newvalues, function (err, res) {
                    if (err) {
                        console.warn(err)
                        return false
                    }
                    console.log("1 user updated");
                    return true
                    // db.close();
                });
            }); // Connects to client
            // let val = this.getUser(user).catch(console.error).then(token => { return token });
            // val.then((data) => {
            //     if (!data) {

        } catch (err) {
            console.warn(err);
            return false
        } finally {
            await this.client.close(); // Closes client connection
            return true
        }
    }
}
module.exports = DatabaseWork
// // databaseI = new DataBaseWork()


// // fs.readFile('clienturl.txt', 'utf8', (err, data) => {
// //     if (err) {
// //         return console.error(err);
// //     } else {
// //         const url = data; // For safety's sake, our user credentials is on a separate doc
// //         let dbwork = new DataBaseWork(url);
// //         console.log(dbwork.changeCredentials("Name2", "Name2", "Hello"));
// //     }
// // });


// const { MongoClient } = require('mongodb');
// const fs = require('fs');
// const sha1 = require('sha1');
// // const crypto = require('sha1');

// class DataBaseWork {
//     /**
//      * Sets up client. 
//      * @param {String} data 
//      */
//     constructor(url) {
//         this.client = new MongoClient(url, { useUnifiedTopology: true }); // Creates client
//     }

//     /**
//      * Hashes the password
//      * @param {String} password 
//      */
//     hashPassword(password) {
//         // console.log(hash.update(password).digest('base64'));
//         return sha1(password);
//     }

//     /**
//      * Gets a user from the DB
//      * @param {String} user 
//      */
//     async getUser(user) {
//         let dat = null;
//         try {
//             await this.client.connect();
//             let dbo = this.client.db("InflaTracker");
//             dbo.collection("InflaTracker").findOne({ name: user }, (err, data) => {
//                 if (err) throw err;
//                 dat = data;
//             });
//         } catch (err) {
//             console.error(err);
//         } finally {
//             await this.client.close();
//             return dat;
//         }
//     }

//     /**
//      * Verifies whether the user is in the DB
//      * @param {String} user 
//      */
//     userExists(user) {
//         let val = this.getUser(user).catch(console.error).then(token => { return token });
//         val.then((data) => {
//             console.log(data);
//             console.log(data != null);
//             return data != null;
//         })
//     }

//     /**
//      * Verifies whether the password is correct
//      * @param {String} user 
//      * @param {String} password 
//      */
//     authenticate(user, password) {
//         let val = this.getUser(user).catch(console.error).then(token => { return token });
//         val.then((data) => {
//             if (data) {
//                 console.log(data);
//                 console.log(data.password == sha1(password));
//                 return data.password == sha1(password);
//             } else console.error("USER DOES NOT EXIST");
//         })
//     }

//     /**
//      * Adds a new user to our collection.
//      * @param {String} user 
//      * @param {String} password 
//      */
//     async addUser(user, password) {
//         try {
//             await this.client.connect(); // Connects to client
//             // let val = this.getUser(user).catch(console.error).then(token => { return token });
//             // val.then((data) => {
//             //     if (!data) {
//             let dbo = this.client.db("InflaTracker");
//             let data = { name: user, password: this.hashPassword(password) };
//             dbo.collection("InflaTracker").insertOne(data, function (err, res) {
//                 if (err) throw err;
//                 console.log("User added");
//             });
//             // } else console.error("USER DOES NOT EXIST");
//             // })
//         } catch (err) {
//             console.error(err);
//         } finally {
//             await this.client.close(); // Closes client connection
//         }
//     }

    // async changeCredentials(oldUser, newUser, newPass) {
    //     let tryI = false
    //     try {
    //         await this.client.connect((err) => {
    //             if(err) {
    //                 console.warn(err)
    //                 return false
    //             }
    //             let dbo = this.client.db("InflaTracker");
    //             let myquery = { name: oldUser };
    //             let newvalues = { $set: { name: newUser, password: this.hashPassword(newPass) } };
    //             dbo.collection("InflaTracker").updateOne(myquery, newvalues, function (err, res) {
    //                 if (err) {
    //                     console.warn(err)
    //                     return false
    //                 }
    //                 console.log("1 user updated");
    //                 return true
    //                 // db.close();
    //             });
    //         }); // Connects to client
    //         // let val = this.getUser(user).catch(console.error).then(token => { return token });
    //         // val.then((data) => {
    //         //     if (!data) {

    //     } catch (err) {
    //         console.warn(err);
    //         return false
    //     } finally {
    //         await this.client.close(); // Closes client connection
    //         return true
    //     }
    // }

// }


// fs.readFile('clienturl.txt', 'utf8', (err, data) => {
//     if (err) {
//         return console.error(err);
//     } else {
//         const url = data; // For safety's sake, our user credentials is on a separate doc
//         let dbwork = new DataBaseWork(url);
//         dbwork.changeCredentials("Nasfdfe2", "Nam", "Hello").then((val) => {
//             console.log(val, "eeey")
//         })
//     }
// });