// json data URL
var earthURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

function circleColor(mag) {
  if (mag <= 2) {
    return "#ffcfdb";
  }
  else if (mag <= 3) {
    return "#ff8992";
  }
  else if (mag <= 4) {
    return "#ff676d";
  }
  else if (mag <= 5) {
    return "#ff4449";
  }
  else {
    return "#ff2224";
  }
};

function circleSize(mag) {
  return mag*5;
}
earthquakeData = {}

// Perform a GET request to the query URL
d3.json(earthURL, function(error, earthquakeData) {
  if (error) throw error;
  console.log(earthquakeData.features);

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakeData.features);
  });
  
  function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>Magnitude: " + 
        feature.properties.mag + "</p>")}
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    var earthquakes = L.geoJSON(earthquakeData, {
      
    //map the description for each point
    onEachFeature : onEachFeature,
    // map the marker color and size
    pointToLayer : function(feature, latlng) {
      return L.circleMarker(latlng,
        {radius: circleSize(feature.properties.mag),
        fillColor: circleColor(feature.properties.mag),
        fillOpacity: 0.75,
        stroke: false,
        bubblingMouseEvent: true}
        );
      }
    });


  // Techtonic plates
  d3.json(plateURL, function(error, plateData) {
    if (error) throw error;
    console.log(plateData.features);
  
      // Once we get a response, send the data.features object to the createFeatures function
      plateFeatures(plateData.features);
    });

    function plateFeatures(plateData) {

      function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>")
      }

  var techPlates = L.geoJson(plateData, {
    onEachFeature: onEachFeature,
    pointToLayer : function(latlng) {
      return L.polygon(features.geometry.coordinates);
    }
  });
  createMap(earthquakes, techPlates);
}};

  
  function createMap(earthquakes, techPlates) {
  
      // Define streetmap and darkmap layers
  var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
  })
  
  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  })

  // Define a baseMaps object to hold our base layers
  var baseMaps = {"Satelite Map": satelitemap,
  "Dark Map": streetMap};

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TechtonicPlates: techPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [satelitemap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Add legend to the map
var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['Magnitude <2','Magnitude 2-3','Magnitude 3-4','Magnitude 4-5','Magnitude 5+'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + circleColor(i+2) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };

  legend.addTo(myMap);
}