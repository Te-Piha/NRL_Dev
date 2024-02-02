from flask import Flask, jsonify
from nrl_data_scraper import fetch_data
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/data')
def get_data():
    return jsonify(fetch_data())

if __name__ == '__main__':
    app.run(debug=True)
