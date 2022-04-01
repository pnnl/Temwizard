from flask import Flask
from flask_bootstrap import Bootstrap
from flask_session import Session
import os

app = Flask(__name__)
Bootstrap(app)
app.config['SECRET_KEY'] = '<replace with a secret key>'
app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, "images")
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
from app import routes
