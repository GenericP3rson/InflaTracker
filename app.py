from flask import Flask, render_template, url_for 
from flask_pymongo import PyMongo

app = Flask(__name__)
with open('clienturl.txt', 'r') as f:
    app.config["MONGO_URI"] = f.read()
    client = PyMongo(app)
    db = client.db.users

@app.route('/')
def index():
    return render_template('about.html')


@app.route('/<string:name>')
def page(name):
    return render_template(name)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
