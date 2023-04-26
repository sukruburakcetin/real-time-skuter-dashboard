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
function updateMap(){
    $.ajax({
        type: "GET",
        url: "/get_data",
        contentType: 'application/json',
        success: function(data) {

            // Loop through each data point and create a GeoJSON Feature object
            var features = [];
            for (var i = 0; i < data.length; i++) {
                var point = data[i];
                var feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [point.enlem, point.boylam]
                    },
                    "properties": {
                        "name": point.durumAciklama
                    }
                };
                features.push(feature);
            }

                        // Clear the previous markers from the map
            if (geojsonLayer) {
                geojsonLayer.clearLayers();
            }

            // Create a GeoJSON layer and add it to the map
            geojsonLayer = L.geoJSON({
                "type": "FeatureCollection",
                "features": features
            }, {
                onEachFeature: function(feature, layer) {
                    // Create a new marker at the feature coordinates
                    var marker = L.marker(feature.geometry.coordinates).addTo(map);

                    // Bind a popup to the marker with the feature name
                    marker.bindPopup(feature.properties.name);
                }
            }).addTo(map);
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

