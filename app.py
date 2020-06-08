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
        {"name": name, "username": username, "password": hashlib.sha224(password).hexdigest()})
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
    

@app.route('/<string:name>')
def page(name):
    return render_template(name)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
