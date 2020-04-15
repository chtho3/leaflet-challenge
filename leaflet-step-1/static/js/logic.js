// json data URL
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function circleColor(mag) {
  if (mag <= 2) {
    return "blue";
  }
  else if (mag <= 3) {
    return "green";
  }
  else if (mag <= 4) {
    return "yellow";
  }
  else if (mag <= 5) {
    return "orange";
  }
  else {
    return "red";
  }
};

function circleSize(mag) {
  return mag*10000;
}

// Perform a GET request to the query URL
d3.json(url, function(error, data) {
  if (error) throw error;
  console.log(data.features);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });
  
  function createFeatures(earthquakeData) {
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    var earthquakes = L.geoJSON(earthquakeData, {
    //map the description for each point
    onEachFeature : function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>Magnitude: " + 
        feature.properties.mag + "</p>")},
    // map the marker color and size
    pointToLayer : function(feature, latlng) {
      return new L.circle(latlng,
        {radius: circleSize(feature.properties.mag),
        fillColor: circleColor(feature.properties.mag),
        fillOpacity: 0.75}
        );
      }
    });
 
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
      // Define streetmap and darkmap layers
  var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

      // Define a baseMaps object to hold our base layers
  var baseMaps = {"Satelite Map": satelitemap};
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
  }).addTo(myMap);

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satelitemap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({postiion: 'topright'});
    legend.onAdd = function() {
      var legendInfo = [{
        limit: "Mag: 0-2",
        color: "blue"
    },{
        limit:"Mag: 2-3",
        color:"green"
    },{
        limit:"Mag: 3-4",
        color:"yellow"
    },{
        limit:"Mag: 4-5",
        color:"orange"
    },{
        limit:"Mag: 5+",
        color:"red"
    }];

    var header = "<h3>Magnitude</h3><hr>";

    var strng = "";
  
    for (i = 0; i < legendInfo.length; i++){
        strng += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
    }
      return header+strng;
    };
  legend.addTo(myMap);
}