const { MongoClient } = require("mongodb")
const fs = require("fs")
fs.readFile("clienturl.txt", "utf8", (err, message) => {
    if (err) {
        throw err
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = message;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect((err) => {
        if(err) throw err
        const collection = client.db("InflaTracker").collection("InflaTracker");
        // perform actions on the collection object
        collection.find({}).toArray((err, result) => {
            if(err) throw err
            console.log(result)
            client.close();
        })
    });
})