from flask import request, Blueprint, jsonify, url_for, redirect
from .models import Player, Bot
from . import db

from sqlalchemy.sql.expression import func


diff = Blueprint("diff", __name__)


def datas(data):
    return {
        "id" : data.id,
        "word" : data.word,
        "meaning": data.meaning,
        "description" : data.description
    }



@diff.route("/easy-profile", methods=["GET", "POST"])
def easy_get_profile():
    id = request.args.get("id")
    if id:
        img = f"assets/img{id}.png"
        return redirect(url_for("view.easy", img=img))
    
    
    
    
############### MEDIUM ##############

@diff.route("/medium-profile", methods=["GET", "POST"])
def medium_get_profile():
    id = request.args.get("id")
    if id:
        img = f"assets/img{id}.png"
        return redirect(url_for("view.medium", img=img))


@diff.route("/medium-single-player-search", methods=["GET", "POST"])
def medium_single_search():
    
    search = request.json["search"].title()
    search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
    
    twoLet = request.json["twoLet"]
    if twoLet == 2:
            botInput = request.json["botInput"]
            print(botInput)
            if botInput == "no data":
                search = request.json["search"].title()
                search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
                return {"data": [datas(data) for data in search_data]}
            else:
                if search[:2] != botInput[-2:].title():
                    return {"data": "wrong-answer"}
                
            
    return {"data": [datas(data) for data in search_data]}


################## HARD ###################
@diff.route("/hard-profile", methods=["GET", "POST"])
def hard_get_profile():
    id = request.args.get("id")
    if id:
        img = f"assets/img{id}.png"
        return redirect(url_for("view.hard", img=img))
    
    
@diff.route("/hard-single-player-search", methods=["GET", "POST"])
def hard_single_search():
    
    search = request.json["search"].title()
    search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
    
    twoLet = request.json["twoLet"]
    if twoLet == 2:
            botInput = request.json["botInput"]
            print(botInput)
            if botInput == "no data":
                search = request.json["search"].title()
                search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
                return {"data": [datas(data) for data in search_data]}
            else:
                if search[:2] != botInput[-2:].title():
                    return {"data": "wrong-answer"}
                
            
    return {"data": [datas(data) for data in search_data]}


################ EXTREME #################
@diff.route("/extreme-profile", methods=["GET", "POST"])
def extreme_get_profile():
    id = request.args.get("id")
    if id:
        img = f"assets/img{id}.png"
        return redirect(url_for("view.extreme", img=img))
    
@diff.route("/extreme-single-player-search", methods=["GET", "POST"])
def extreme_single_search():
    
    search = request.json["search"].title()
    search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
    
    twoLet = request.json["twoLet"]
    if twoLet == 2:
            botInput = request.json["botInput"]
            print(botInput)
            if botInput == "no data":
                search = request.json["search"].title()
                search_data = Player.query.filter(Player.word.like(f'%{search}%')).order_by(func.random()).limit(3).all()
                return {"data": [datas(data) for data in search_data]}
            else:
                if search[:2] != botInput[-2:].title():
                    return {"data": "wrong-answer"}
                
            
    return {"data": [datas(data) for data in search_data]}