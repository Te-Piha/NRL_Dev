from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from nrl_data_scraper import fetch_data  

app = Flask(__name__)
CORS(app)

STORAGE_FILE = "storage.json"

# ✅ Utility Functions for JSON File Storage
def read_storage():
    """Read data from storage.json"""
    try:
        with open(STORAGE_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"ideal_picks": [], "drafted_players": []}  # Default structure if file is missing

def write_storage(data):
    """Write data to storage.json"""
    with open(STORAGE_FILE, "w") as file:
        json.dump(data, file, indent=4)

# ✅ Existing Data Fetch Route
@app.route('/data')
def get_data():
    return jsonify(fetch_data())

# ✅ Fetch all ideal picks
@app.route('/ideal_picks', methods=['GET'])
def get_ideal_picks():
    data = read_storage()
    return jsonify(data["ideal_picks"])

# ✅ Add a player to ideal picks
@app.route('/ideal_picks', methods=['POST'])
def add_ideal_pick():
    data = read_storage()
    new_pick = request.json  # Expect { "player_id": 12, "position": "HOK", "name": "Player Name" }

    # Ensure no duplicate picks
    if any(p['player_id'] == new_pick['player_id'] for p in data["ideal_picks"]):
        return jsonify({"error": "Player already in ideal picks"}), 400

    data["ideal_picks"].append(new_pick)
    write_storage(data)
    
    return jsonify({"message": "Player added"}), 201

# ✅ Fetch all drafted players
@app.route('/drafted_players', methods=['GET'])
def get_drafted_players():
    data = read_storage()
    return jsonify(data["drafted_players"])

# ✅ Add a player to drafted list
@app.route('/drafted_players', methods=['POST'])
def add_drafted_player():
    data = read_storage()
    new_pick = request.json  # Expect { "player_id": 22, "position": "FB", "name": "Player X" }

    # Ensure no duplicate drafts
    if any(p['player_id'] == new_pick['player_id'] for p in data["drafted_players"]):
        return jsonify({"error": "Player already drafted"}), 400

    data["drafted_players"].append(new_pick)
    write_storage(data)
    return jsonify({"message": "Player added to drafted list"}), 201

# ✅ Remove a player from drafted list
@app.route('/drafted_players/<int:player_id>', methods=['DELETE'])
def remove_drafted_player(player_id):
    data = read_storage()
    data["drafted_players"] = [p for p in data["drafted_players"] if p['player_id'] != player_id]
    write_storage(data)
    return jsonify({"message": "Player removed from drafted list"}), 200

# ✅ Fetch players with optional filtering & sorting
@app.route('/players', methods=['GET'])
def get_players():
    players = fetch_data()
    position = request.args.get('position')
    sort_key = request.args.get('sort')

    if position:
        players = [p for p in players if p["position"] == position]
    if sort_key and sort_key in players[0]:
        players.sort(key=lambda x: x[sort_key], reverse=True)

    return jsonify(players)

if __name__ == "__main__":
    app.run(debug=True)
