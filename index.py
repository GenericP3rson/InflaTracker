import matplotlib
'''
Main Application File
'''

import numpy as np
import pandas as pd
import makeAccount as makeAccount # Account Information
import hashing, os # hashing algorithm and os
import matplotlib.pyplot as plt
from flask import Flask, render_template, send_from_directory, jsonify, request
from sklearn.cluster import KMeans as KM
app = Flask(__name__, static_url_path="/static")
processedData = "processedData"
accountData = pd.read_csv("Accounts.csv")
NAME = "inflaTracker.png"

matplotlib.use('Agg')
try:
    data = pd.read_csv(F"{processedData}.csv").values.T
except:
   # Excepts every time...
   # Import our processing code
   import processing
   data = processing.parsify()
   # Now write it into a new file.
   pd.DataFrame(np.array(data).T).to_csv(f"{processedData}.csv", header=False, index=False)

user = makeAccount.CSV()
class Crohns(makeAccount.CSV):
    def loginAndEnter(self, user, word):
        '''
        Extends makeAccount.CSV. This will login using makeAccount.CSV's login function, then it sets instance variables to the information
        TODO Have database instead
        '''
        self.login(user, word)
        self.stuff = eval(self.getStats())
        self.change = False
        self.allCoord = np.array([np.array([x, y-x]) for j in self.stuff for _, x, y, _ in j])
    def printPoints(self):
        # x = [x for j in self.stuff for _, x, y, _ in j]
        # y = [y-x for j in self.stuff for _, x, y, _ in j]
        self.labels = [label for j in self.stuff for label, _, _, _ in j]
        if len(self.allCoord) == 0:
            plt.text(0, 0, "Make Sure To Eat First!", color="red", fontsize=15)
            plt.savefig("static/" + NAME)
            self.src = NAME
            return 0
        # print(ratio)
        plt.ylabel("NO REACTION")
        plt.xlabel("REACTION")
        plt.yticks(np.arange(0, max(self.allCoord[:, 0]) + 10, 1))
        plt.xticks(np.arange(0, max(self.allCoord[:, 1]) + 10, 1))
        # plt.scatter(np.array(x), np.array(y))
        # plt.scatter(self.allCoord[:, 0], self.allCoord[:, 1])
        # for i, txt in enumerate(self.labels):
        #     # plt.annotate(txt, (x[i], y[i]))
        #     plt.annotate(txt, (self.allCoord[i][0], self.allCoord[i][1]))
        # plt.show()
        return 1
    def KMeans(self):
        return1 = self.printPoints()  
        if not return1:
            return
        algorithm = KM(n_clusters=2)
        categories = algorithm.fit_predict(self.allCoord)
        print(self.allCoord)
        print(categories)
        plt.scatter(self.allCoord[categories == 0, 0], self.allCoord[categories == 0, 1], c= "green")
        plt.scatter(self.allCoord[categories == 1, 0],self.allCoord[categories == 1, 1], c="red")
        plt.scatter(algorithm.cluster_centers_[:, 0], algorithm.cluster_centers_[:, 1], c= "black", marker="*")
        print(len(self.labels), len(self.allCoord))
        for i, txt in enumerate(self.labels):
            plt.annotate(txt, (self.allCoord[i][0], self.allCoord[i][1]))
        plt.annotate("NO INFLAMMATION", algorithm.cluster_centers_[0])
        plt.annotate("CAUSES INFLAMMATION", algorithm.cluster_centers_[1])
        plt.savefig("static/" + NAME)
        self.src = NAME
    def orderToEaten(self):
        '''
        Makes the fancy array based on % change into just an array of the ingredients eaten
        '''
        self.ingEaten = [i for j in self.order for i in j]
        # print(len(self.ingEaten))
        # print(self.ingEaten)
    def openData(self):
        '''
        This will open the data and create keys.
        '''
        li = []
        for i in self.ing:
            if (type(i) == type([])):
                li += i
        self.foodSet = list(set(li))  # List of all foods
        self.foodToIng = {food: ing for food, ing in zip(self.food, self.ing)} # Food to ingredient 
        self.foodToNum = {food: num for num, food in enumerate(self.foodSet)} # Food to index in food list  
        # print(self.foodToIng["BAGELS"])

    def enterFood(self, food, inflammed):
        '''
        This will enter the data into the list of foods eaten.
        '''
        results = eval(self.findFood(food)) # Whether the food is in the database; if yes, returns array
        if results:
            for i in results:
                inIt = False
                for j in self.ingEaten: # If the person has already eaten the ingredient
                    if i == j[0]:
                        if inflammed: j[1]+=1 # Adds one to inflammed
                        j[2]+=1 # Adds one to total
                        j[3] = j[1]/j[2] # Updates the %
                        inIt = True
                        break
                if not inIt: # If they haven't eaten the food yet.
                    self.ingEaten.append([i, int(inflammed), 1, float(inflammed)])
            return self.filter()
        return 0
    def findFood(self, food):
        '''
        This function checks if the food exists within the dataset. If it does, it will return the ingredients of the food.
        '''
        self.openData()
        if (not food in self.foodToIng): 
            print(f"ERROR: {food} not found") # Will print an error
            return False
        else: 
            return self.foodToIng[food] # Returns the ingredients 
    def mostLikely(self):
        '''
        This just organises the foods based on the % of inflammations.
        '''
        self.ingEaten = sorted(self.ingEaten, reverse = True, key=lambda x:x[3])
    def filter(self):
        '''
        This will group food together based on the % of inflammations.
        '''
        self.mostLikely() # First sorts the list
        if (len(self.ingEaten) > 0):
            num = self.ingEaten[0][3] # Sets it to the most common
            count = 0
            self.order = [[self.ingEaten[0]]] # Holds the food based on index
            i = 1
            while i < len(self.ingEaten):
                if (self.ingEaten[i][3] == num):
                    self.order[count].append(self.ingEaten[i]) # Adds it if they have the same frequency
                else:
                    num = self.ingEaten[i][3]
                    count+=1
                    self.order.append([self.ingEaten[i]]) # Else creates a new frequency list
                i+=1
            self.editStats(str(self.order))
        else: self.order = []
        return self.order
    def getGoodIng(self):
        if self.authenticated:
            self.filter()
            if len(self.order) > 1:
                self.bestIng = [ans for ans, _, _, _ in self.order[-1]]
            else: self.bestIng = ["NO RESULTS YET"]
            print(self.bestIng)
            return self.bestIng
        else: return []
    def getBadIng(self):
        if self.authenticated:
            self.filter()
            if len(self.order) > 1:
                self.worstIng = [ans for ans, _, _, _ in self.order[0]]
            else: self.worstIng = ["NO RESULTS YET"]
            print(self.worstIng)
            return self.worstIng
        else: return []
    def getBadFood(self, limit = 10, random = True):
        if self.authenticated:
            self.badFood = []
            self.getBadIng()
            if (self.worstIng[0] == "NO RESULTS YET"):
                self.badFood = ["NO RESULTS YET"]
                return self.badFood
            for num, stuff in enumerate(data[1]):
                stuff = eval(stuff)
                if type(stuff) != float:
                    for x in stuff:
                        for i in self.worstIng:
                            if (x == i): 
                                self.badFood.append(data[0][num])
                                break
                if (len(self.badFood) > limit):
                    break
            # print("HELLO")
            print(self.badFood)
            return self.badFood
        else: return []
    def getGoodFood(self, limit = 10, random = True):
        if self.authenticated:
            self.goodFood = []
            self.getGoodIng()
            if (self.bestIng[0] == "NO RESULTS YET"):
                self.goodFood = ["NO RESULTS YET"]
                return self.goodFood
            for num, stuff in enumerate(data[1]):
                stuff = eval(stuff)
                hold = True
                if type(stuff) != float:
                    for x in stuff:
                        hold = x in self.bestIng
                        if (not hold): break
                if (hold): 
                    self.goodFood.append(data[0][num])
                if (len(self.goodFood) > limit):
                    break
            # print("HELLO")
            print(self.goodFood)
            return self.goodFood
        else: return []
    def printFa(self):
        '''
        This is a nice way to print out the foods based on frequency.
        '''
        for i in self.order:
            print(f"\nOCCURRING IN {i[0][3]*100}%:")
            print([x[0] for x in i])

    def __init__(self, accounts = "Accounts"):
        super()
        super().__init__(accounts)
        self.food = data[0]
        self.ing = data[1]
        self.ingEaten = [] # Key: [[ingName, total # of inflams, total # of times eaten, % of inflams]]
        self.accountInfo = ""
        self.src = ""
        # Okay, automatically when we start the server the user isn't logged in.
        @app.route('/')
        def _home():
            '''
            Home file
            '''
            return render_template('profile.html', logo="static/brandIcon.png", accountInfo={
                    "user": self.user
                })
        @app.route("/edit/<string:name>/<string:name1>")
        def _open(name, name1):
            '''
            Adjusts any account changes
            '''
            if name == "userchange":
                self.editUsername(name1)
            elif name == "namechange":
                self.editName(name1)
            elif name == "passwordchange":
                self.changePassword(self.words[self.ind], hashing.hashTag(name1))
            elif name == "signout":
                self.authenticated = False
                self.user = ""
            return "1"
        @app.route('/<string:name>', methods=["GET"])
        def _get_javascript_data(name):
            if name == "process":
                return ", ".join(data[0])
            elif name == "analyse":
                print(";; ".join([",, ".join(self.getGoodIng()), ",, ".join(self.getBadIng()), ",, ".join(self.getGoodFood()), ",, ".join(self.getBadFood())]))
                return ";; ".join([",, ".join(self.getGoodIng()), ",, ".join(self.getBadIng()), ",, ".join(self.getGoodFood()), ",, ".join(self.getBadFood())])
            if(render_template(name)):
                # Remember: ** We have a profile image, which was added in the accounts section. **
                if self.user != "":
                    self.KMeans()
                return render_template(name, logo="static/brandIcon.png", accountInfo={
                    "user": self.user
                }, src=self.src)
            return render_template("404.html")
        @app.route("/ingredients/<string:name>/<string:name1>", methods=["GET"])
        def _get_ingredients(name, name1):
            self.enterFood(name, name1 == "1")
            self.stuff = eval(self.getStats())
            return "1"
        @app.route("/signUp", methods=["POST"])
        def _():
            username = request.form.get("accountName")
            passName = request.form.get("password")
            successful = self.addClient(username, passName)
            if successful:
                self.loginAndEnter(username, passName)
            return "1" if successful else "0"
        @app.route("/<string:name>", methods=["POST"])
        def _getData(name):
            # Go through our stuff
            username = request.form.get("accountName")
            attemptedPass = request.form.get("password")
            ans = "1" if self.login(username, attemptedPass) else "0"
            if ans == "1":
                self.loginAndEnter(username, attemptedPass)
            return ans
        if __name__ == '__main__':
            app.run(debug=True)

i = Crohns()
