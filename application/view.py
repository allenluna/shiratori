from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify
from flask_login import current_user
from . import db

from .models import Player, Bot, Multiplayer_Lobby, Lobby_User, User
import random
from flask_socketio import emit
from . import socketio  # Import socketio from __init__.py
from sqlalchemy import asc

view = Blueprint("view", __name__)

# @socketio.on('start_game')
# def handle_start_game():
#     emit('reload_page', broadcast=True)

@view.route("/")
def home():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
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
                           player1_name=players_user[0].username if len(players_user) > 0 else 'Unknown',
                           player2_name=players_user[1].username if len(players_user) > 1 else 'Unknown',
                           user_turn=current_turn,
                           login_user_current=current_user,
                           plyr1=players_user[0].id,
                           plyr2=players_user[1].id
                           )



# Global variable for turn lock
turn_lock = False

@socketio.on('switch_turn')
def handle_switch_turn(lobby_id):
    global turn_lock
    if turn_lock:
        emit('turn_switch_error', {'message': 'Turn switch in progress, please wait.'}, broadcast=True)
        return

    if isinstance(lobby_id, str) and not lobby_id.isdigit():
        emit('turn_switch_error', {'message': 'Invalid lobby ID'}, broadcast=True)
        return

    lobby_id = int(lobby_id)
    lobby_users = Lobby_User.query.filter_by(lobby_id=lobby_id).all()
    players = [User.query.get(user.user_id) for user in lobby_users]
    players_user = [player for player in players if player is not None]

    if len(players_user) < 2:
        emit('turn_switch_error', {'message': 'Not enough players'}, broadcast=True)
        return

    current_turn_player = User.query.filter_by(turn=True).first()
    
    if current_turn_player:
        # Check if the current user is the one whose turn it is
        if current_user.username != current_turn_player.username:
            emit('turn_switch_error', {'message': 'It\'s not your turn'}, broadcast=True)
            return
        
        turn_lock = True  # Lock the turn switch
        try:
            # Switch the turn
            current_turn_player.turn = False
            db.session.commit()

            # Determine next player
            next_turn_player = players_user[(players_user.index(current_turn_player) + 1) % len(players_user)]
            next_turn_player.turn = True
            db.session.commit()

            # Check to ensure the state is correct before emitting
            if current_turn_player.username != next_turn_player.username:
                print(f"Turn switched to: {next_turn_player.username}")  # Debugging log
                emit('turn_changed', {'current_turn': next_turn_player.username}, broadcast=True)
                emit('turn_status', {
                    'is_user_turn': next_turn_player.username == current_user.username,
                    'current_turn': next_turn_player.username
                }, broadcast=True)

        finally:
            turn_lock = False  # Release the lock

    else:
        emit('turn_switch_error', {'message': 'Current turn player not found'}, broadcast=True)


@socketio.on('get_turn')
def handle_get_turn(): 
    if not current_user.is_authenticated:  # Check if the user is authenticated
        emit('turn_status', {'is_user_turn': False, 'current_turn': None})
        return

    current_turn_player = User.query.filter_by(turn=True).first()
    current_turn = current_turn_player.username if current_turn_player else None
    is_user_turn = (current_user.username == current_turn)

    emit('turn_status', {
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
    # Emit an event to notify clients to update the UI for starting the game
    emit('game_started', broadcast=True)

@socketio.on('stop_game')
def handle_stop_game():
    # Emit an event to notify clients to update the UI for stopping the game
    emit('game_stopped', broadcast=True)


@view.route("/lobby-full")
def lobby_full():
    
    return render_template("lobbyFull.html")


########################## end of multiplayer ############################


@view.route("/manage", methods=["GET", "POST"])
def add_words():
    
    if not current_user.username == "admin":
        return redirect(url_for("view.home"))
    
    return render_template("addWords.html")

@view.route("/data-tables", methods=["GET", "POST"])
def data_tables():
    
    players = Player.query.order_by(asc(Player.word)).all()
    bots = Bot.query.all()

    
    return render_template("dataTables.html", players=players, bots=bots )


@view.route("/player-dictionary", methods=["GET", "POST"])
def player_dictionary():
    
    
    return render_template("playerDictionary.html", current_user=current_user)


@view.route("/bot-dictionary", methods=["GET", "POST"])
def bot_dictionary():
    
    
    return render_template("botDictionary.html", current_user=current_user)



################################### options html ##########################################
@view.route("/easy")
def easy():
    

    return render_template("difficulty/easy.html", player=current_user)


@view.route("/medium")
def medium():
    

    return render_template("difficulty/medium.html", player=current_user)

@view.route("/hard")
def hard():
    

    return render_template("difficulty/hard.html", player=current_user)


@view.route("/extreme")
def extreme():
    

    return render_template("difficulty/extreme.html", player=current_user)

################## Forgot Password ################

