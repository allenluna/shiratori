from flask import Blueprint, url_for, redirect, request, jsonify, session
from . import db
from .models import Multiplayer_Lobby, Lobby_User, Player, User
from flask_login import login_required, current_user
from sqlalchemy.sql.expression import func
from .controller import datas
from flask import session
from . import socketio
from flask_socketio import emit

multiplayer = Blueprint("multiplayer", __name__)


@multiplayer.route("/create-lobby", methods=["GET", "POST"])
def create_lobby():
    data = request.json
    name = data.get('name')
    if name:
        lobby = Multiplayer_Lobby(name=name, users=0, max_users=2)  # Set max_users as needed
        db.session.add(lobby)
        db.session.commit()
        return jsonify({"data": "works", "name": name, "id": lobby.id, "admin": current_user.username})
    return jsonify({"data": "error", "message": "Invalid lobby name"}), 400


@multiplayer.route("/delete-lobby", methods=["GET", "POST", "DELETE"])
def delete_lobby():
    
    if request.method == "DELETE":
        data = request.json
        id = int(data.get("id"))
        lobby = Multiplayer_Lobby.query.get(id)
        
        db.session.delete(lobby)
        db.session.commit()
        return {"data": "works"}
    return "Works"


@multiplayer.route("/get-lobbies", methods=["GET", "POST"])
def get_lobbies():
    lobbies = Multiplayer_Lobby.query.all()
    lobbies_info = []

    for lobby in lobbies:
        # Count the number of users in the lobby
        user_count = Lobby_User.query.filter_by(lobby_id=lobby.id).count()

        lobbies_info.append({
            "id": lobby.id,
            "name": lobby.name,
            "has_users": user_count > 0,
            "user_count": lobby.users,
            "admin": current_user.username
        })

    return jsonify(lobbies_info)

 

@multiplayer.route("/join-lobby/<int:lobby_id>", methods=["GET", "POST"])
def join_lobby(lobby_id):
    lobby = Multiplayer_Lobby.query.get_or_404(lobby_id)
    user_in_lobby = Lobby_User.query.filter_by(lobby_id=lobby_id, user_id=current_user.id).first()
    
    if user_in_lobby:
        return redirect(url_for('view.fight_lobby', lobby_id=lobby_id))
    

    if lobby.users < lobby.max_users:
        lobby.users += 1
        lobby_user = Lobby_User(user_id=current_user.id, lobby_id=lobby_id)
        db.session.add(lobby_user)
        db.session.commit()
        return redirect(url_for('view.fight_lobby', lobby_id=lobby_id))
    else:
        return redirect(url_for('view.lobby_full'))
    
    
@multiplayer.route("/quit-lobby/<int:lobby_id>", methods=["POST"])
@login_required
def quit_lobby(lobby_id):
    # Find the lobby and the user in the lobby
    lobby = Multiplayer_Lobby.query.get_or_404(lobby_id)
    lobby_user = Lobby_User.query.filter_by(lobby_id=lobby_id, user_id=current_user.id).first()
    
    if not lobby_user:
        return redirect(url_for("view.home"))
    session.pop('lobby_id', None)
    # Remove the user from the lobby
    db.session.delete(lobby_user)
    lobby.users -= 1
    
    # Commit changes
    db.session.commit()
    
    return redirect(url_for('view.multi_player'))


@multiplayer.route("/players-answer", methods=["POST"])
def player_answer():
    try:
        data = request.json
        player1_answer = data.get("player1_answer", "").title()
        player2_answer = data.get("player2_answer", "").title()
        # Handle player1_answer
        if player1_answer:
            player1_id = int(data.get("player1_id", 0))
            player1 = User.query.get(player1_id)

            if not player1 or player1_answer is None:
                return jsonify({"error": "Invalid player ID or answer."})
            print(player1_answer)

            search_data = Player.query.filter(Player.word.like(f'%{player1_answer}%')).order_by(func.random()).limit(1).all()
            result_data = [datas(data) for data in search_data]
            return jsonify({"data": result_data})

        # Handle player2_answer
        if player2_answer:
            player2_id = int(data.get("player2_id", 0))
            player2 = User.query.get(player2_id)
                
            if not player2 or player2_answer is None:
                return jsonify({"error": "Invalid player ID or answer."})
        
            print(player2_answer)
            search_data = Player.query.filter(Player.word.like(f'%{player2_answer}%')).order_by(func.random()).limit(1).all()
            result_data = [datas(data) for data in search_data]
            return jsonify({"data": result_data})

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "message": str(e)}), 500

@socketio.on("player1-answer")
def player_answer(answer):
    
    print(f"This is player1 {answer}")
    
@socketio.on("player2-answer")
def player_answer(answer):
    
    print(f"This is player2 {answer}")