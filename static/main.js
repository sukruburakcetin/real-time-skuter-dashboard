var map = L.map('map').setView([41.008806, 28.980162], 13);

var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
})

var esriLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri'
})

var mapboxStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic3VrcnVidXJha2NldGluIiwiYSI6ImNsODM4cHg2YzAzNHozdWxoajU0dWt6ODgifQ.kqIwO3bpD-U5qrisUnJLIA'
})

// Add only the selected layer back to the map
var selectedLayer = mapboxStreets
selectedLayer.addTo(map);


var layerControl = L.control.layers({
    // Only show the selected layer in the layer control
    'Esri': esriLayer,
    'Osm': osmLayer,
    'Mapbox': mapboxStreets
}).addTo(map);


var geojsonLayer;

// define the suitabilityLayer variable outside of the callback function
var noParkingZones=  $.getJSON('/static/tekil_kamu.geojson', function(data) {
  console.log(data); // log the GeoJSON data
  // create a new GeoJSON layer and assign it to the suitabilityLayer variable
  noParkingZones = L.geoJSON(data, {
    style: function(feature) {
        var gridcode = data.properties;
        console.log("gridcode", gridcode)

      return {
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.2,
          fillColor: 'black'
      };
    }
  }).addTo(map)
});



function updateMap(){
    $.ajax({
        type: "GET",
        url: "/get_data",
        contentType: 'application/json',
        success: function(data) {
            var intersecting_points = data.intersecting_points;
            console.log("intersecting_points", intersecting_points[0][0][0])
            console.log("intersecting_points", intersecting_points[0][0][1])
            // Only keep the last 100 data points
            var features = data.data.map(function(point) {
                return {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [point.enlem, point.boylam]
                    },
                    "properties": {
                        "name": point.durumAciklama
                    }
                };
            });

            console.log("feature_count", features.length)

            if (!geojsonLayer) {
                // console.log("if")
                // Create a new GeoJSON layer if it doesn't exist
                geojsonLayer = L.geoJSON({
                    "type": "FeatureCollection",
                    "features": features
                }, {
                    onEachFeature: function(feature, layer) {
                        var marker = L.marker(feature.geometry.coordinates).addTo(map);
                        var latlng = marker.getLatLng();
                        marker.bindPopup(feature.properties.name + '<br>Latitude: ' + latlng.lat.toFixed(6) +
                            '<br>Longitude: ' + latlng.lng.toFixed(6) );

                        // Loop through intersecting_points array and check if feature intersects
                        for (var i = 0; i < intersecting_points.length; i++) {
                            console.log("lat", latlng.lat)
                            console.log("lng", latlng.lng)
                            console.log("0: ", intersecting_points[i][0][0])
                            console.log("1: ", intersecting_points[i][0][1])
                            if (intersecting_points[i][0][0] === latlng.lng && intersecting_points[i][0][1] === latlng.lat) {
                                // Bind tooltip to intersecting feature
                                console.log("girdi")
                                marker.bindTooltip('Intersecting feature: ' + feature.properties.name, {permanent: true}).openTooltip();
                                break;
                            }
                        }

                        setTimeout(function() {
                            map.removeLayer(marker);
                        }, 29500);
                    }
                }).addTo(map);
                // console.log("count if geo json: ", geojsonLayer.getLayers.length)
            } else {
                // console.log("else")
                // Update the data of the existing layer
                geojsonLayer.clearLayers();
                geojsonLayer.addData({
                    "type": "FeatureCollection",
                    "features": features
                });
            }
        },
        error: function(error) {
            console.log("fail_return_log", error);
        }
    });
}

// Update the map initially
updateMap();

// Update the map every 30 seconds
setInterval(updateMap, 30000);






