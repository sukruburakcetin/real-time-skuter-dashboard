import json

import requests
from flask import Flask, jsonify, request, render_template
from shapely import Point
from shapely.geometry import shape
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route('/get_data', methods=['GET'])
def get_data():
    intersecting_points = []
    # Your code here
    url = 'https://raw.githubusercontent.com/sukruburakcetin/real-time-skuter-dashboard/develop/static/tekil_kamu.geojson'
    kamu_binalari = requests.get(url).json()

    with open(r'C:\Users\sukruburak.cetin\Desktop\github-projects\kp\data.json', 'r', encoding='utf-8') as f:
        data_current = json.load(f)

    json_data = jsonify(data_current).json # Get the JSON data from the Response object
    for i in range(0, len(data_current)):
        # print("i: ", i)
        point = Point(data_current[i]['boylam'], data_current[i]['enlem'])
        current_kamu_binasi = shape(kamu_binalari['features'][0]['geometry'])
        if current_kamu_binasi.intersects(point):
            print("point: ", point)
            intersecting_points.append(list(point.coords))
            print("point_inside_now: ", point)

    # Create a new dictionary and add intersecting_points to it
    data = {'data': json_data, 'intersecting_points': intersecting_points}

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)