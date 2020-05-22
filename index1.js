// Creates the server and manages all the GET/POST requests.
const http = require("http"),
fs = require("fs"),
MIMETypes = {
    "html": "text/html",
    "jpg": "image/jpeg",
    "ico": "image/vnd.microsoft.icon",
    "js": "text/javascript",
    "png": "image/png",
    "ttf": "font/ttf",
    "css": "text/css"
},
user = [
    // We don't know anything about the user yet.
]
http.createServer((req, res) => {
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
            console.log(kee, message)
            for(let i = 0; i < kee.length; i++) {
                // What are they asking for?
                if(!(kee[i] in user) && kee[i].split("=").length == 1) {
                    // Then they need to go to the signin page.
                    res.writeHead(200, {"Content-Type": MIMETypes["html"]})
                    res.write("login.html")
                    res.end()
                    messageI = true
                    break
                } else if(kee[i].split("|") > 1) {
                    // Okay, here we check
                    // *SIGN IN HERE*
                }
                else {
                    // *SIGN UP HERE*
                    user[kee[i].split("=")[0]] = user[kee[i].split("=")[1]]
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
}).listen(3030, "127.0.0.1", () => {
    console.log("Set it up!")
})