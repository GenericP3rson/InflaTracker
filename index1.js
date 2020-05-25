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
},
userLoggedIn = {}
let serv = http.createServer((req, res) => {
    let PathToRead = req.url
    if(req.method == "GET") {   
        if(req.url == "/") {
            PathToRead = "/home.html"
        }
        fs.readFile("Frontend" + PathToRead, (err, message) => {
            if(err) {
                res.writeHead(404, {"Content-Type": MIMETypes["html"]})
                fs.readFile("Frontend/404.html", (err, message) => {
                    if(err)
                        throw "Something went seriously wrong."
                    res.write(message)
                    res.end()
                })
            } else {
                // Find MIME type
                console.log(PathToRead)
                let MType = MIMETypes[PathToRead.split(".")[1]] || "application/octet-stream"
                console.log(MType)
                res.writeHead(200, {"Content-Type": MType})
                res.write(message)
                res.end()
            }
        })
    } else {
        let message = ""
        req.on("data", chunk => {
            message += chunk.toString()
        })
        req.on("end", () => {
            let messageI = false,
            kee = message.split("&")
            for(let i = 0; i < kee.length; i++) {
                // What are they asking for?
                // console.log(kee[i].split("|").length == 1, kee[i].split("=").length == 1)
                if(kee[i].split("=").length == 1 && kee[i].split("|").length == 1) {
                    if("name" in userLoggedIn && "password" in userLoggedIn) {
                        res.writeHead(200)
                        res.write("Yeeeeah.")
                        res.end()
                        messageI = true
                    } else { // Then they need to go to the signin page.
                        res.writeHead(403)
                        res.write("login.html")
                        res.end()
                        console.log("Reroute to login.")
                        messageI = true
                    }
                    break
                } else if(kee[i].split("|").length > 1) {
                    // Okay, here we check
                    // *SIGN IN HERE*
                    // database.
                    console.log("Trying to sign in...")
                    database.authenticate(kee[0].split("|")[1], kee[1].split("|")[1]).then((val) => {
                        // Now that we're logged in,
                        // Take in the info we've got and put it into userLoggedIn
                        res.write(val.toString())
                        if(val) {
                            // Putting it into userLoggedIn
                            userLoggedIn = val
                        }
                        res.end()
                    })
                    messageI = true
                    break
                }
                else {
                    // *SIGN UP HERE*
                    database.addUser(kee[0].split("=")[1], kee[1].split("=")[1])
                    break
                }
            }
            if(!messageI) {
                console.log(messageI)
                res.writeHead(200, {"Content-Type": MIMETypes["html"]})
                res.write("home.html")
                res.end()
            }
        })
    }
})
fs.readFile("clienturl.txt", "utf8", (err, message) => {
    if(err) throw err
    database.init(message).then(() => {
        // Now the client is connected
        console.log("Client connected")
        serv.listen(3030, "127.0.0.1", () => {
            console.log("Set it up!")
        })
    })
    // database.changeCredentials("Nasfdfe2", "Nam", "Hello")

})