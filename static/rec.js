document.getElementById("chooseButtons").addEventListener("change", () => {
    let x = document.getElementsByName("chooseGraph");
    console.log(x);
    if (x[1].checked) {
        let xhttp = new XMLHttpRequest();
        let goodfood = document.getElementById("goodfood"),
            badfood = document.getElementById("badfood"),
            gooding = document.getElementById("gooding"),
            bading = document.getElementById("bading");
        xhttp.onreadystatechange = (e) => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let everything = e.target.responseText.split(";; ");
                let phrases = ["INGREDIENTS TO EAT", "INGREDIENTS NOT TO EAT", "FOODS TO EAT", "FOODS NOT TO EAT"];
                let things = [goodfood, badfood, gooding, bading];
                for (let i = 0; i < things.length; ++i) {
                    things[i].innerHTML = `${phrases[i]}\n${everything[i].split(",, ").join("\n")}`;
                    alert(phrases[i] + ": " + everything[i].split(",, ").join(", "));
                }
                document.getElementById("back").checked = true;
            }
        }
        xhttp.open("GET", "analyse");
        xhttp.send();
    }
});