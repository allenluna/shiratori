from . import db
from flask_login import UserMixin
from sqlalchemy import JSON

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    is_admin = db.Column(db.String(10))
    

class Player(db.Model):
    __tablename__ = "player"
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100))
    meaning = db.Column(db.String(100))
    description = db.Column(db.String(100))
    
class Bot(db.Model):
    __tablename__ = "bot"
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100))
    meaning = db.Column(db.String(100))
    description = db.Column(db.String(100))
    
