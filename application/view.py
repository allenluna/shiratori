from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user
import os
from dotenv import load_dotenv

view = Blueprint("view", __name__)


@view.route("/")
def home():
    if not current_user.is_authenticated:
        return redirect(url_for("auth.login"))
    load_dotenv()
    print(os.environ.get("DATABASE_URL"))
    return render_template("home.html", current_user=current_user)

@view.route("/single-player")
def single_player():
    
    return render_template("singlePlayer.html")


@view.route("/manage", methods=["GET", "POST"])
def add_words():
    
    if current_user.is_admin != "admin":
        return redirect(url_for("view.home"))
    
    return render_template("addWords.html", current_user=current_user)