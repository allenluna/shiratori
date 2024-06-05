from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import os
from dotenv import load_dotenv

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "asdasdsa sadsadsadas"
    # load_dotenv()
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://postgres:qwerty@localhost:5432/agkas"
    # app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
    
    
    login_manager = LoginManager()
    login_manager.init_app(app)

    from .models import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)
        
    from .view import view
    from .auth import auth
    from .controller import controller
    
    app.register_blueprint(view, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(controller, url_prefix="/")
    
    
    
    db.init_app(app)
    with app.app_context():
        db.create_all()
    
    return app