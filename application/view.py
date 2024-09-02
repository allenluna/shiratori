from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify
from flask_login import current_user
from . import db

from .models import Player, Bot, Multiplayer_Lobby, Lobby_User, User
import random
from flask_socketio import emit
from . import socketio  # Import socketio from __init__.py

view = Blueprint("view", __name__)

# @socketio.on('start_game')
# def handle_start_game():
#     emit('reload_page', broadcast=True)

@view.route("/")
def home():
    if not current_user.is_authenticated:
        return redirect(url_for("auth.login"))
    return render_template("home.html", current_user=current_user)

@view.route("/single-player")
def single_player():
    
    return render_template("singlePlayer.html")


############### multi player ##############

@view.route("/multi-player")
def multi_player():
    
    lobbies = Multiplayer_Lobby.query.all()
    return render_template("multiPlayer.html", lobbies=lobbies)


@view.route('/fight/<int:lobby_id>', methods=['GET'])
def fight_lobby(lobby_id):
    session['lobby_id'] = lobby_id
    lobby_users = Lobby_User.query.filter_by(lobby_id=lobby_id)
    players = [User.query.get(user.user_id) for user in lobby_users]
    players_user = [player for player in players if player is not None]

    if len(players_user) < 2:
        return render_template('quitUser.html', lobby_id=lobby_id), 200

    # Ensure that the first player always has the first turn
    if not any(player.turn for player in players_user):  # If no player has a turn
        players_user[0].turn = True
        db.session.commit()  # Save the changes to the database
        
    # Check whose turn it is
    current_turn = next((player for player in players_user if player.turn), players_user[0])
    return render_template('fight.html',
                           lobby_id=lobby_id,
                           player1_name=players_user[0].name if len(players_user) > 0 else 'Unknown',
                           player2_name=players_user[1].name if len(players_user) > 1 else 'Unknown',
                           user_turn=current_turn,
                           login_user_current=current_user,
                           plyr1=players_user[0].id,
                           plyr2=players_user[1].id
                           )

@view.route('/switch-turn', methods=['POST'])
def switch_turn():
    lobby_id = request.json.get('lobby_id')
    if isinstance(lobby_id, str) and not lobby_id.isdigit():
        return jsonify({'success': False, 'message': 'Invalid lobby ID'}), 400

    lobby_id = int(lobby_id)
    lobby_users = Lobby_User.query.filter_by(lobby_id=lobby_id)
    players = [User.query.get(user.user_id) for user in lobby_users]
    players_user = [player for player in players if player is not None]

    if len(players_user) < 2:
        return jsonify({'success': False, 'message': 'Not enough players'}), 400

    current_turn_player = next((player for player in players_user if player.turn), None)
    current_turn_player = User.query.filter_by(turn=True).first()
    # print(current_turn_player.name)
    if current_turn_player:
        current_turn_player.turn = False
        db.session.commit()

        # Switch to the next player
        next_turn_player = players_user[(players_user.index(current_turn_player) + 1) % len(players_user)]
        next_turn_player.turn = True
        db.session.commit()

        return jsonify({'success': True, 'message': 'Turn switched successfully'})
    else:
        return jsonify({'success': False, 'message': 'Current turn player not found'}), 400


@view.route('/get-turn')
def get_turn():
    user_name = request.args.get('user_name')
    if not user_name:
        return jsonify({'is_user_turn': False, 'current_turn': None}), 400
    # print(user_name)
    current_turn_player = User.query.filter_by(turn=True).first()
    current_turn = current_turn_player.name if current_turn_player else None
    is_user_turn = (current_user.name == current_turn)
    print(current_turn)
    return jsonify({
        'is_user_turn': is_user_turn,
        'current_turn': current_turn
    })


@view.route('/get-lobby-id', methods=['GET'])
def get_lobby_id():
    lobby_id = session.get('lobby_id')
    if not lobby_id:
        return jsonify({'error': 'Lobby ID not found'}), 404
    return jsonify({'lobby_id': lobby_id})

@socketio.on('start_game')
def handle_start_game():
    emit('reload_page', broadcast=True)
    
    
@socketio.on('stop_game')
def handle_stop_game():
    emit('stop_page', broadcast=True)

@view.route("/lobby-full")
def lobby_full():
    
    return render_template("lobbyFull.html")


########################## end of multiplayer ############################


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
    player = request.args.get("img")
    if not player:
        return "Player image parameter is missing", 400
    
    bot_int = random.randint(1, 3)
    while str(bot_int) in player:
        bot_int = random.randint(1, 3)
    
    bot = f"assets/img{bot_int}.png"
    return render_template("difficulty/easy.html", player=player, bot=bot)


@view.route("/medium")
def medium():
    player = request.args.get("img")
    if not player:
        return "Player image parameter is missing", 400
    
    bot_int = random.randint(1, 3)
    while str(bot_int) in player:
        bot_int = random.randint(1, 3)
    
    bot = f"assets/img{bot_int}.png"
    return render_template("difficulty/medium.html", player=player, bot=bot)

@view.route("/hard")
def hard():
    player = request.args.get("img")
    if not player:
        return "Player image parameter is missing", 400
    
    bot_int = random.randint(1, 3)
    while str(bot_int) in player:
        bot_int = random.randint(1, 3)
    
    bot = f"assets/img{bot_int}.png"
    return render_template("difficulty/hard.html", player=player, bot=bot)


@view.route("/extreme")
def extreme():
    player = request.args.get("img")
    if not player:
        return "Player image parameter is missing", 400
    
    bot_int = random.randint(1, 3)
    while str(bot_int) in player:
        bot_int = random.randint(1, 3)
    
    bot = f"assets/img{bot_int}.png"
    return render_template("difficulty/extreme.html", player=player, bot=bot)

################## Forgot Password ################

