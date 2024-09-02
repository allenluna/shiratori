from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import os
from flask_session import Session
from dotenv import load_dotenv
from flask_socketio import SocketIO
from flask_migrate import Migrate
from flask_mail import Mail

db = SQLAlchemy()
mail = Mail()
socketio = SocketIO() 
migrate = Migrate()
def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "asdasdsa sadsadsadas"
    load_dotenv()
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://postgres:qwerty@localhost:5432/agkas"
    # app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    
    app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get("email")
    app.config['MAIL_PASSWORD'] = os.environ.get("password")
    
    
    login_manager = LoginManager()
    login_manager.init_app(app)

    from .models import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)
        
    from .view import view
    from .auth import auth
    from .controller import controller
    from .difficulty import diff
    from .multiplayer import multiplayer
    
    app.register_blueprint(view, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(controller, url_prefix="/")
    app.register_blueprint(diff, url_prefix="/")
    app.register_blueprint(multiplayer, url_prefix="/")
    
    
    
    socketio.init_app(app)
    mail.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    Session(app)
    with app.app_context():
        db.create_all()
    
    return app