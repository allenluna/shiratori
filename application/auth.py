from flask import render_template, redirect, url_for, request, Blueprint, flash
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from .models import User
from . import db

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["GET", "POST"])
def register():
    
    if request.method == "POST":
    
        name = request.form.get("name")
        email = request.form.get("email")
        password = generate_password_hash(request.form.get("password"), method="pbkdf2:sha256", salt_length=8)
        status = request.form.get("status")
        user = User.query.filter_by(email=email).first()
        
        if user:
            flash("Email already registered.")
        elif name == "":
            flash("Name is required.")
        elif email == "":
            flash("Email is required.")
        elif password == "":
            flash("Password is required.")
        elif status == "":
            flash("Status is required.")
        elif len(password) < 8:
            flash("Password is too short.")
        else:
            new_user = User(name=name, email=email, password=password, is_admin=status)
            db.session.add(new_user)  
            db.session.commit()
            
            login_user(new_user)
            return redirect(url_for("view.home"))
    
    
    return render_template("register.html", current_user=current_user)



@auth.route("/login", methods=["GET", "POST"])
def login():

    email = request.form.get("email")
    password = request.form.get("password")
    user = User.query.filter_by(email=email).first()
    print(email)
    if request.method == "POST":
        if not user:
            flash("Email does not exists, please sign up.")
        elif not check_password_hash(user.password, password):
            flash("Incorrect password, try again.")
        else:
            login_user(user)
            return redirect(url_for("view.home"))

    return render_template("login.html", current_user=current_user)


@auth.route("/logout")
@login_required
def logout():
    logout_user()

    return redirect(url_for("auth.login"))