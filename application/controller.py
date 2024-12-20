from flask import request, Blueprint, jsonify
from .models import Player, Bot
from . import db
from sqlalchemy import func
import re
from sqlalchemy import asc

controller = Blueprint("controller", __name__)

def datas(data):
    return {
        "id" : data.id,
        "word" : data.word,
        "meaning": data.meaning,
        "description" : data.description
    }


@controller.route("/add-player", methods=["GET", "POST"])
def add_player():
    if request.method == "POST":
        word = request.json["word"].title()
        meaning = request.json["meaning"].title()
        desc = request.json["description"]

        check_word_exists = Player.query.filter_by(word=word).first()
        
        if check_word_exists:
            return jsonify({"error": "Already Exists."})
        
        if not word and not meaning and not desc:
            return jsonify({"error": "All fields are required."})

        player = Player(
            word = word,
            meaning = meaning,
            description = desc
        )
        
        db.session.add(player)
        db.session.commit()
        
        

        return jsonify({"data": datas(player)}), 201

    return jsonify({"data": "Use POST to add player."}), 200

@controller.route("/add-bot", methods=["GET", "POST"])
def add_bot():
    if request.method == "POST":
        word = request.json["word"].title()
        meaning = request.json["meaning"].title()
        desc = request.json["description"]

        check_word_exists = Bot.query.filter_by(word=word).first()
        
        if check_word_exists:
            return jsonify({"error": "Already Exists."})
        
        if not word and not meaning and not desc:
            return jsonify({"error": "All fields are required."})

        bot = Bot(
            word = word,
            meaning = meaning,
            description = desc
        )
        
        db.session.add(bot)
        db.session.commit()
        

        return jsonify({"data": datas(bot)}), 201

    return jsonify({"data": "Use POST to add player."}), 200


############################### player search ##################################

@controller.route("/single-player-search", methods=["GET", "POST"])
def single_search():
    
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

@controller.route("/bot-search", methods=["GET", "POST"])
def bot_search():
    # Ensure JSON request contains "search" key
    if not request.json or "search" not in request.json:
        return jsonify({"error": "Missing search parameter"}), 400

    # Get the search term and capitalize it
    search = request.json["search"]

    # Find the last syllable using regex
    # syllable_match = re.search(r"([aeiouy][^aeiouy]*)([^aeiouy]*$)", search, re.IGNORECASE)
    # syllable_match = re.search(r"([^aeiouy]*[aeiouy][^aeiouy]*)$", search, re.IGNORECASE)
    syllable_match = re.search(r"([aeiouy]+[^aeiouy]*)$", search, re.IGNORECASE)


    if syllable_match:
        last_syllable = syllable_match.group(0)
        print(last_syllable)
        # Query to find words containing the last syllable
        # search_data = Bot.query.filter(Bot.word.like(f'%{last_syllable}%')).order_by(func.random()).limit(1).all()
        search_data = Bot.query.filter(Bot.word.ilike(f'{last_syllable}%')).order_by(func.random()).limit(1).all()


        # Return data if found
        return jsonify({"data": [datas(data) for data in search_data]})

    # Return empty data if no syllable match is found
    return jsonify({"data": []})

#################################### data tables controller ###########################

@controller.route("/player-table", methods=["GET", "POST"])
def player_table():
    
    players = Player.query.order_by(asc(Player.word)).all()
    for player in players:
        print(player.word)
    
    return {"data": [datas(data) for data in players]}


################################## table data edit ###########################
@controller.route("/player-edit", methods=["GET", "POST"])
def player_edit():
    id = int(request.json["id"])
    player = Player.query.get(id)
    return {"data": datas(player)}

@controller.route("/player-edit-result", methods=["GET", "POST"])
def player_edit_result():
    id = int(request.json["id"])
    word = request.json["word"]
    meaning = request.json["meaning"]
    description = request.json["description"]
    
    player = Player.query.get(id)
    
    player.word = word
    player.meaning = meaning
    player.description = description
    
    db.session.commit()
    
    return {"data": datas(player)}

 
################### delete data ###############################

@controller.route("/delete-player-data", methods=["POST"])
def delete_player():
    id = request.json["id"]
    player = Player.query.get(id)
    if player:
        db.session.delete(player)
        db.session.commit()
        return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "error": "Player not found"}), 404
    
    
    ################################## table data edit ###########################
@controller.route("/bot-table", methods=["GET"])
def bot_table():
    bots = Bot.query.order_by(asc(Bot.word)).all()
    return jsonify({"data": [datas(bot) for bot in bots]})    

@controller.route("/bot-edit", methods=["GET", "POST"])
def bot_edit():
    id = int(request.json["id"])
    player = Bot.query.get(id)
    
    return {"data": datas(player)}

@controller.route("/bot-edit-result", methods=["GET", "POST"])
def bot_edit_result():
    id = int(request.json["id"])
    word = request.json["word"]
    meaning = request.json["meaning"]
    description = request.json["description"]
    
    player = Bot.query.get(id)
    
    player.word = word
    player.meaning = meaning
    player.description = description
    
    db.session.commit()
    
    return {"data": datas(player)}


################### delete data ####################################

@controller.route("/delete-bot-data", methods=["POST"])
def delete_bot():
    id = request.json["id"]
    player = Bot.query.get(id)
    if player:
        db.session.delete(player)
        db.session.commit()
        return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "error": "Player not found"}), 404
    
    
    
##################################### player dictionary data ###################################
@controller.route("/player-dic", methods=["GET", "POST"])
def player_dic():
    player_dic_data = Player.query.order_by(asc(Player.word)).all()
    
    return {"data": [datas(data) for data in player_dic_data]}





