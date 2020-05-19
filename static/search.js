const transform = (arr) => {
    console.assert(arr.length > 0)
    let finalDict = new Array(100).fill(0)
    for (let i = 0; i < arr.length; i++) {
        finalDict[arr[i].toLowerCase().charCodeAt(0) - 31] = 1
    }
    return finalDict
}
const revert = (arr) => {
    let finalDict = ""
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            finalDict += String.fromCharCode(i + 31)
        }
    }
    return finalDict
}

let list = [];
// Let's quickly do an HTTP request to get our list.
let xhttp = new XMLHttpRequest(),
    showAmount = 100;
xhttp.onreadystatechange = (e) => {
    if (e.target.readyState == 4 && e.target.status == 200) {
        list = e.target.responseText.split(", ")
        list = list.slice(0, 239089)
        let newArr = list.map((val) => {
            return [transform(val), val]
        }).sort((a, b) => {
            return a[0] - b[0]
        })
        // Okay, we're basically going to:
		/*
		- Alphabetize this.
		*/
        let val = ""
        // If we've already rendered this before, we set this to the exact height; until, then, we just assume it's 25 px.
        let newFiltered = list,
            showAmount = 100
        const reaction = (e) => {
            let start = performance.now(),
                val = document.getElementById("a").value
            showAmount = 100
            if (val == "") {
                // Don't even try.
                return
            }
            let fullList = []
            for (let i = 0; i < val.length; i++) {
                fullList.push(val[i].toLowerCase().charCodeAt(0) - 31)
            }
            fullList = fullList.sort()
            newFiltered = []
            // Now go through list and filter.
            for (let i = 0; i < newArr.length; i++) {
                let doWork = true
                for (let ii = 0; ii < fullList.length; ii++) {
                    if (!newArr[i][0][fullList[ii]]) {
                        doWork = false
                    }
                }
                if (doWork) {
                    if (newArr[i][1].toLowerCase().includes(val.toLowerCase())) {
                        newFiltered.splice(0, 0, newArr[i][1])
                    }
                    else {
                        newFiltered.push(newArr[i][1])
                    }
                }
            }
            refresh(newFiltered.slice(0, showAmount))
            defaultTime = performance.now() - start
        }
        document.getElementById("submit").addEventListener("click", reaction)
        document.getElementById("a").addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                document.getElementById("submit").focus()
                reaction()
            }
        })
        const refresh = (options) => {
            document.getElementById("option").innerHTML = ""
            for (let i = 0; i < options.length; i++) {
                let newElement = document.createElement("div"),
                    node = document.createTextNode(options[i]),
                    newElement1 = document.createElement("div"),
                    node1 = document.createTextNode("ADD")
                if (JSON.stringify(options[i].split("").slice(0, 40)) != JSON.stringify(options[i].split(""))) {
                    node = document.createTextNode(options[i].split("").slice(0, 40).join("") + "...")
                }
                newElement1.name = i
                newElement1.className = "addButton"
                newElement.id = options[i]
                newElement1.addEventListener("click", () => {
                    // TODO: GET request to ingredients.
                    let xhttp = new XMLHttpRequest(),
                        ans = prompt("Did this upset your stomach?").toLowerCase() == "yes" ? 1 : 0
                    xhttp.onreadystatechange = () => {
                        if (xhttp.readyState == 4 && xhttp.status == 200) {
                            newElement1.innerHTML = "ADDED!"
                            setTimeout(() => {
                                newElement1.innerHTML = "ADD"
                            }, 1500)
                            console.log(xhttp.responseText)
                        }
                    }
                    xhttp.open("GET", "ingredients/" + options[i] + "/" + ans)
                    xhttp.send()
                })
                newElement.className = "children"
                newElement.appendChild(node)
                newElement1.appendChild(node1)
                newElement.appendChild(newElement1)
                document.getElementById("option").appendChild(newElement)
                defaultHeight = newElement.getBoundingClientRect().height
            }
        }

        window.addEventListener("scroll", () => {
            if (window.scrollY + window.innerHeight > document.body.scrollHeight) {
                let store = window.scrollY
                if (newFiltered.slice(0, showAmount) !== newFiltered.slice(0, showAmount + 20)) {
                    showAmount += 20
                    if (newFiltered) {
                        refresh(newFiltered.slice(0, showAmount))
                        window.scrollTo(0, store)
                    }
                }
            }
        })
        let elements = document.getElementsByClassName("children")
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener("click", () => {
                // Okay, now we tell the webpage to launch with info about this item, ingredients,
                // And 
            })
        }
        refresh(list.slice(0, showAmount))
    }
}
xhttp.open("GET", "process")
xhttp.send()