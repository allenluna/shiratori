from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user

from .models import Player, Bot

view = Blueprint("view", __name__)


@view.route("/")
def home():
    if not current_user.is_authenticated:
        return redirect(url_for("auth.login"))
    return render_template("home.html", current_user=current_user)

@view.route("/single-player")
def single_player():
    
    return render_template("singlePlayer.html")


@view.route("/manage", methods=["GET", "POST"])
def add_words():
    
    if current_user.is_admin != "admin":
        return redirect(url_for("view.home"))
    
    return render_template("addWords.html", current_user=current_user)

@view.route("/data-tables", methods=["GET", "POST"])
def data_tables():
    
    players = Player.query.all()
    bots = Bot.query.all()

    
    return render_template("dataTables.html", players=players, bots=bots ,current_user=current_user)


@view.route("/player-dictionary", methods=["GET", "POST"])
def player_dictionary():
    
    
    return render_template("playerDictionary.html", current_user=current_user)


@view.route("/bot-dictionary", methods=["GET", "POST"])
def bot_dictionary():
    
    
    return render_template("botDictionary.html", current_user=current_user)



################################### options html ##########################################
@view.route("/easy")
def easy():
    return render_template("difficulty/easy.html")


