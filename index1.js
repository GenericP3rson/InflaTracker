// Creates the server and manages all the GET/POST requests.
const http = require("http"),
fs = require("fs"),
database = require("./database.js")
MIMETypes = {
    "html": "text/html",
    "jpg": "image/jpeg",
    "ico": "image/vnd.microsoft.icon",
    "js": "text/javascript",
    "png": "image/png",
    "ttf": "font/ttf",
    "css": "text/css"
}, // An object which holds all the different file endings and what to put in the content header when I send it over to the frontend.
userLoggedIn = {} // A placeholder to tell whether we're logged in or not
// it will hold all the user's data once we've logged in. For now, this is empty, because we haven't logged in yet.
let serv = http.createServer((req, res) => {
    let PathToRead = req.url;
    if(req.method == "GET") {   
        if(req.url == "/") {
            // The home page.
            // When the user first reaches the page.
            PathToRead = "/home.html";
        } else if (req.url == "/data") {
            console.log(userLoggedIn);
            res.writeHead(200, { "Content-Type":"text" });
            // res.write(database.getUser(userLoggedIn));
            res.write(`${userLoggedIn["name"]};;${userLoggedIn["username"]}`);
            console.log("Love you");
            res.end();
            return;
        }
        fs.readFile("Frontend" + PathToRead, (err, message) => {
            if(err) {
                res.writeHead(404, {"Content-Type": MIMETypes["html"]});
                fs.readFile("Frontend/404.html", (err, message) => {
                    if(err)
                        throw "Something went seriously wrong.";
                    res.write(message);
                    res.end();
                })
            } else {
                // Find MIME type
                console.log(PathToRead);
                let MType = MIMETypes[PathToRead.split(".")[1]] || "application/octet-stream";
                // Octet-stream is the default for if I can't find out what file type it is.
                console.log(MType);
                res.writeHead(200, {"Content-Type": MType});
                res.write(message);
                res.end();
            }
        })
    } else { // POST requests
        let message = "";
        req.on("data", chunk => {
            // The data is sent in chunks, and this is adding up all the chunks and putting them together.
            console.log(chunk.toString());
            message += chunk.toString();
        })
        req.on("end", () => {
            // console.log("MESSAGE BELOW");
            // console.log(message);
            // We've received all the chunks and now we process them.
            let messageI = false,
            kee = message.split("&");
            if (req.url == "/update") {
                let obj = {};
                for (let i = 0; i < kee.length; i++) {
                    let brea = kee[i].split("|")
                    obj[brea[0]] = brea[1];
                }
                console.log(obj);
                console.log(userLoggedIn["username"] +""+ obj["oldpassword"] +  obj["name"] + obj["username"] + obj["newpass1"]);
                let x = database.changeCredentials(userLoggedIn["username"], obj["oldpassword"], obj["name"], obj["username"], obj["newpass1"]);
                console.log("Success?");
                console.log(x);
            } else {
                for(let i = 0; i < kee.length; i++) {
                    // What are they asking for?
                    // console.log(kee[i].split("|").length == 1, kee[i].split("=").length == 1)
                    if(kee[i].split("=").length == 1 && kee[i].split("|").length == 1) {
                        if("name" in userLoggedIn && "password" in userLoggedIn) { // If logged in
                            res.writeHead(200);
                            res.write("Logged in.");
                            res.end();
                            messageI = true;
                        } else { // Then they need to go to the signin page.
                            res.writeHead(403);
                            res.write("login.html");
                            res.end();
                            console.log("Reroute to login.");
                            messageI = true;
                        }
                        break;
                    } else if(kee[i].split("|").length > 1) {
                        // if (req.url == "/update") {
                        //     console.log("Something Something Something");
                        //     console.log(kee[i].split("|"));
                        // }
                        // Okay, here we check
                        // *SIGN IN HERE*
                        // database.
                        console.log("Trying to sign in...");
                        database.authenticate(kee[0].split("|")[1], kee[1].split("|")[1]).then((val) => {
                            // Now that we're logged in,
                            // Take in the info we've got and put it into userLoggedIn
                            res.write(val.toString());
                            if(val) {
                                // Putting it into userLoggedIn
                                userLoggedIn = val;
                            }
                            res.end();
                        })
                        messageI = true;
                        break
                    }
                    else {
                        // *SIGN UP HERE*
                        database.addUser(kee[0].split("=")[1], kee[1].split("=")[1], kee[2].split("=")[1]); // Oh! Okay, let's do this then!
                        break
                    }
                }
                if(!messageI) {
                    console.log(messageI);
                    res.writeHead(200, {"Content-Type": MIMETypes["html"]});
                    res.write("home.html");
                    res.end();
                }
            }
        })
    }
})
fs.readFile("clienturl.txt", "utf8", (err, message) => {
    if(err) throw err
    database.init(message).then(() => { // Basically inits the DB
        // Now the client is connected
        console.log("Client connected");
        serv.listen(3030, "127.0.0.1", () => {
            console.log("Set it up!");
        })
    })
    // database.changeCredentials("Nasfdfe2", "Nam", "Hello")

})