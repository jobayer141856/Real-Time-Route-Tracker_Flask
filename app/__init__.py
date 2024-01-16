from random import randint
from flask import *
from flask_mail import *
import flask_bcrypt
import bcrypt
import pymongo



db_client = pymongo.MongoClient("mongodb://localhost:27017")
db = db_client["route_tracker"]


app = Flask(__name__)
app.config.from_object(__name__)
mail = Mail(app)

app.secret_key = "testing"

from app.routes import index
