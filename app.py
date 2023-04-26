import json

from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route('/get_data', methods=['GET'])
def get_data():
    # Your code here
    with open(r'C:\Users\sukruburak.cetin\Desktop\github-projects\kp\data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        json_data = jsonify(data)
    return json_data


if __name__ == "__main__":
    app.run(debug=True)