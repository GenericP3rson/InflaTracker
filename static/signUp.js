document.getElementById("submitI").addEventListener("click", () => {
    // Let's check up what our server says about this.
    document.getElementById("loading").style.opacity = 1
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            if (xhttp.responseText == 0) {
                // Okay, get angry.
                let elements = document.getElementsByTagName("input")
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.borderBottom = "3px solid red"
                    elements[i].value = ""
                }
                document.getElementById("err").innerHTML = "ERROR IN AUTHENTICATION. PLEASE TRY AGAIN."
                document.getElementById("loading").style.opacity = 0
            } else {
                // Our code knows we're good now; let's help ourselves out by reloading the page with all our info.
                window.location.reload(true)
            }
        }
    }
    xhttp.open("POST", "myInfo", true)
    xhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded")
    xhttp.send(`accountName=${document.getElementById("user").value}&password=${document.getElementById("pass").value}`)
})
document.getElementById("signup").addEventListener("click", () => {
    document.getElementById("loading").style.opacity = 1
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            if (xhttp.responseText == "0") {
                let elements = document.getElementsByTagName("input")
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.borderBottom = "3px solid red"
                    elements[i].value = ""
                }
                document.getElementById("err").innerHTML = "ERROR: Choose another username, please."
                document.getElementById("loading").style.opacity = 0
            }
            else {
                window.location.reload(true)
            }
        }
    }
    xhttp.open("POST", "signUp", true)
    xhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded")
    xhttp.send(`accountName=${document.getElementById("user").value}&password=${document.getElementById("pass").value}`)

})