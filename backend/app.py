from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from nrl_data_scraper import fetch_data  

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

STORAGE_FILE = "storage.json"

# ✅ Utility Functions for JSON File Storage
def read_storage():
    """Read data from storage.json"""
    try:
        with open(STORAGE_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"ideal_picks": [], "drafted_players": [], "priority_list": []}  # Default structure if file is missing

def write_storage(data):
    """Write data to storage.json"""
    with open(STORAGE_FILE, "w") as file:
        json.dump(data, file, indent=4)

# ✅ Existing Data Fetch Route
@app.route('/data')
def get_data():
    return jsonify(fetch_data())

# ✅ Fetch all drafted players
@app.route('/drafted_players', methods=['GET'])
def get_drafted_players():
    data = read_storage()
    return jsonify(data["drafted_players"])

# ✅ Add a player to drafted list
@app.route('/drafted_players', methods=['POST'])
def add_drafted_player():
    data = read_storage()
    new_pick = request.json  

    # Ensure no duplicates
    if any(p['id'] == new_pick['id'] for p in data["drafted_players"]):
        return jsonify({"error": "Player already drafted"}), 400

    data["drafted_players"].append(new_pick)  # Append instead of overwrite
    write_storage(data)
    return jsonify(new_pick), 201

# ✅ Remove all drafted players
@app.route('/drafted_players', methods=['DELETE'])
def clear_drafted_players():
    data = read_storage()
    data["drafted_players"] = []  # Fully clear the list
    write_storage(data)
    return jsonify({"message": "All drafted players cleared"}), 200

# ✅ Fetch priority list
@app.route('/priority_list', methods=['GET'])
def get_priority_list():
    data = read_storage()
    return jsonify(data.get("priority_list", []))  # Default to empty list if missing

# ✅ Save priority list
@app.route('/priority_list', methods=['POST'])
def save_priority_list():
    data = read_storage()
    priority_players = request.json  
    data["priority_list"] = priority_players  # Save the updated priority list
    write_storage(data)
    return jsonify({"message": "Priority list saved"}), 201

if __name__ == "__main__":
    app.run(debug=True)
