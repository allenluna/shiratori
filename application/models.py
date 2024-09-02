from . import db
from flask_login import UserMixin
from sqlalchemy import JSON
from sqlalchemy.orm import Relationship


class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    username = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    is_admin = db.Column(db.String(10))
    turn = db.Column(db.Boolean, default=False)
    answer = db.Column(JSON, default=[])
    score = db.Column(db.Integer, default=0)
    reset_token = db.Column(db.String(10000), nullable=True)
    reset_token_expiration = db.Column(db.DateTime, nullable=True)
    

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
    
class Multiplayer_Lobby(db.Model):
    __tablename__ = "multiplayers"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    users = db.Column(db.Integer, default=0)
    max_users = db.Column(db.Integer, default=2)
    
class Lobby_User(db.Model):
    __tablename__ = 'lobby_users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    lobby_id = db.Column(db.Integer, db.ForeignKey('multiplayers.id'))
    user = db.relationship('User', backref='lobby_users')
    lobby = db.relationship('Multiplayer_Lobby', backref='lobby_users')