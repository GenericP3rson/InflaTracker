from flask import Flask, render_template, url_for, request, redirect 
from flask_pymongo import PyMongo
import hashlib

app = Flask(__name__)
with open('clienturl.txt', 'r') as f:
    app.config["MONGO_URI"] = f.read()
    client = PyMongo(app)
    db = client.db.users
    USER = ""

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/signup', methods=["POST"])
def signup():
    global USER
    name = request.form.get("name", False)
    username = request.form.get("username", False)
    password = request.form.get("password", False).encode('utf-8')
    second = request.form.get("re-enter", False).encode('utf-8')
    if username == "" or password == "" or name == "" or second == "" or password != second:
        return render_template('signup.html') # Add error message later
    exists = db.find_one({"username": username})
    if exists != None:
        return render_template('signup.html') # User already exists
    print(username, password)
    USER = username
    db.insert_one(
        {
            "name": name, "username": username, "password": hashlib.sha224(password).hexdigest(),
            "favourites": [], "recent": [], "meals": [], "history": {"ingredients": {}, "foods": {}}
        }
    )
    return redirect('home.html')
    

@app.route('/login', methods=["POST"])
def login():
    global USER
    username = request.form.get("username", False)
    password = request.form.get("password", False).encode('utf-8')
    if username == "" or password == "":
        return render_template('login.html')  # Add error message later
    valid = db.find_one(
        {"username": username, "password": hashlib.sha224(password).hexdigest()})
    if valid == None:
        return render_template('login.html')  # Invalid User
    print(username, password)
    USER = username
    return redirect('home.html')

@app.route('/profile.html')
def place():
    global USER
    print(USER)
    # for i in db.find({}):
    #     print(i)
    user = db.find_one_or_404({"username": USER})
    return render_template("profile.html", name=user["name"], nameUpper = user["name"].upper(), username = user["username"])
    # return render_template('profile.html')

@app.route('/updateProfile', methods=["POST"])
def updateProfile():
    global USER 
    user = db.find_one_or_404({"username": USER})
    name = request.form.get("name", False)
    username = request.form.get("username", False)
    password = request.form.get("password", False).encode('utf-8')
    second = request.form.get("password2", False).encode('utf-8')
    if username == "" or password == "" or name == "" or second == "" or password != second or hashlib.sha224(password).hexdigest() != user["password"]:
        return render_template('signup.html')  # Add error message later
    user["username"] = username 
    user["name"] = name 
    user["password"] = hashlib.sha224(password).hexdigest()
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    USER = username
    return redirect("profile.html")

def getIngredientFromFood(food):
    # We'll figure this out eventually
    return ["Ingredient"]

@app.route('/addFavourite/<string:food>')
def addFav(food):
    global USER
    user = db.find_one_or_404({"username": USER})
    user["favourites"].append(food)
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    return render_template('pickFoods.html')


@app.route('/removeFavourite/<string:food>')
def rmFav(food):
    global USER
    user = db.find_one_or_404({"username": USER})
    user["favourites"].remove(food)
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    return render_template('pickFoods.html')


@app.route('/addMeal/<string:food>')
def addMeal(food):
    global USER
    user = db.find_one_or_404({"username": USER})
    user["meals"].append(food)
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    return render_template('pickFoods.html')


@app.route('/removeMeal/<string:food>')
def rmMeal(food):
    global USER
    user = db.find_one_or_404({"username": USER})
    user["meals"].remove(food)
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    return render_template('pickFoods.html')

@app.route('/addFood/<string:food>/<string:inflammed>', methods=["POST"])
def addFood(food, inflammed):
    global USER
    user = db.find_one_or_404({"username": USER})
    inflammed = bool(inflammed)
    try: # If food exists
        user["history"]["foods"][food]["times_eaten"]+=1 # adds one to eaten
        if inflammed: 
            user["history"]["foods"][food]["inflammed"] += 1 # If inflammed, add one to inflammed
            for ingredient in user["history"]["foods"][food]["ingredients"]: # Update the ingredients
                try: # If ingredient exists
                    user["history"]["ingredients"][ingredient]["times_eaten"] += 1
                    user["history"]["ingredients"][ingredient]["inflammed"] += 1
                    user["history"]["ingredients"][ingredient]["proportion"] = user["history"]["foods"][ingredient]["inflammed"] / \
                        user["history"]["ingredients"][ingredient]["times_eaten"]
                    user["history"]["ingredients"][ingredient]["foods"].append(food)
                except: # Else create the ingredient
                    user["history"]["ingredients"][ingredient] = {
                        "times_eaten":1 , "inflammed": 1, "proportion": 1, "foods": [food]
                    }
        else: 
            # Update the ingredients
            for ingredient in user["history"]["foods"][food]["ingredients"]:
                try:  # If ingredient exists
                    user["history"]["ingredients"][ingredient]["times_eaten"] += 1
                    user["history"]["ingredients"][ingredient]["proportion"] = user["history"]["foods"][ingredient]["inflammed"] / \
                        user["history"]["ingredients"][ingredient]["times_eaten"]
                    user["history"]["ingredients"][ingredient]["foods"].append(
                        food)
                except:  # Else create the ingredient
                    user["history"]["ingredients"][ingredient] = {
                        "times_eaten": 1, "inflammed": 0, "proportion": 0, "foods": [food]
                    }
        user["history"]["foods"][food]["proportion"] = user["history"]["foods"][food]["inflammed"] / \
            user["history"]["foods"][food]["times_eaten"]
    except: 
        if inflammed:
            user["history"]["foods"][food] = {
                "inflammed": 1, "times_eaten": 1, "proportion": 1, "ingredients": getIngredientFromFood(food)}
        else: 
            user["history"]["foods"][food] = {
                "inflammed": 1, "times_eaten": 1, "proportion": 1, "ingredients": getIngredientFromFood(food)}
    user["current"].append(food)
    if len(user["current"]) > 10:
        user["current"].pop(0)
    user = {"$set": user}
    db.update_one(db.find_one_or_404({"username": USER}), user)
    return render_template('pickFoods.html')

@app.route('/<string:name>')
def page(name):
    return render_template(name)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
