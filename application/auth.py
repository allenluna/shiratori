from flask import current_app, render_template, redirect, url_for, request, Blueprint, flash
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import or_
from datetime import datetime, timedelta, timezone
from .models import User
from . import db
from flask_mail import Message
from . import mail

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["GET", "POST"])
def register():
    
    if request.method == "POST":
    
        name = request.form.get("name")
        username = request.form.get("username")
        email = request.form.get("email")
        password = generate_password_hash(request.form.get("password"), method="pbkdf2:sha256", salt_length=8)
        # status = request.form.get("status")
        user = User.query.filter(or_(User.email == email, User.username == username)).first()
        
        if user:
            flash("Already registered.")
        elif name == "":
            flash("Name is required.")
        elif email == "":
            flash("Email is required.")
        elif password == "":
            flash("Password is required.")
        elif len(password) < 8:
            flash("Password is too short.")
        else:
            new_user = User(name=name, username=username ,email=email, password=password, is_admin="student")
            db.session.add(new_user)  
            db.session.commit()
            
            login_user(new_user)
            return redirect(url_for("view.home"))
    
    
    return render_template("register.html", current_user=current_user)



@auth.route("/login", methods=["GET", "POST"])
def login():

    username = request.form.get("username")
    password = request.form.get("password")
    user = User.query.filter_by(username=username).first()
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


################# forgot password #############


def send_email(to, subject, template):
    msg = Message(
        subject,
        recipients=[to],
        html=template,
        sender="agkas2024@gmail.com"
    )
    mail.send(msg)


@auth.route("/forgot-pass", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form.get("email")
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Generate reset token
            serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
            token = serializer.dumps(user.email, salt='password-reset-salt')
            
            # Save token to the user model
            user.reset_token = token
            user.reset_token_expiration = datetime.now(timezone.utc) + timedelta(hours=1)
            db.session.commit()
            
            # Send email with reset link (you would implement send_email function)
            reset_url = url_for('auth.reset_password', token=token, _external=True)
            send_email(user.email, "Password Reset", f"{user.email}, Click to reset your password: {reset_url}")
            
            flash("A password reset link has been sent to your email.", "success")
        else:
            flash("This email is not registered.", "danger")
        
        return redirect(url_for("auth.forgot_password"))
    
    return render_template("forgot_pass.html")


@auth.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        flash("The reset link is invalid or has expired.", "danger")
        return redirect(url_for("auth.forgot_password"))
    
    user = User.query.filter_by(email=email).first_or_404()
    
    if request.method == "POST":
        new_password = request.form.get("password")
        user.password = generate_password_hash(new_password, method="pbkdf2:sha256", salt_length=8)
        user.reset_token = None
        user.reset_token_expiration = None
        db.session.commit()
        
        flash("Your password has been updated!", "success")
        return redirect(url_for("auth.login"))
    
    return render_template("reset_password.html")
