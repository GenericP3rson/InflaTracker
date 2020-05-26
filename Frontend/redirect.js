/*
On all pieces, checks whether the user is signed in or not.
*/
let xhttp = new XMLHttpRequest()
xhttp.onreadystatechange = () => {
    if(xhttp.readyState == 4 && xhttp.status == 403) {
        console.log("NOT LOGGED IN")
        window.location.href = "login.html"
    } else if(xhttp.status == 200) {
        console.log("User is logged in.")
    }
}
xhttp.open("POST", "/")
xhttp.send("username&password")