//query the USGS API
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const api_key = "pk.eyJ1IjoiY2Fyc29ubGVwcmUiLCJhIjoiY2swN2Z6N2NzMDc3ajNib2JmZDA1N3VlOCJ9.rehbVxixsGnyYv4TFOKH4A"

// GET request
d3.json(queryUrl, function(data) {

  // feed response to the populate_marker_data function
  console.log(data.features);
  populate_marker_data(data.features);
}
);

// add legend information
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1,2,3,4,5],//list of buckets for magnitude grade
        grade_buckets = [];//empty list which will populate legend later

    //loop for bucketing.
    for (var i = 0; i < grades.length; i++)
    {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : ' and up');
    }
    console.log('div' + div);
  return div;
};
//
function getColor(i)
{
  x = Math.ceil(i);
  switch (Math.ceil(x)) {//call 'ceiling' from the Math library, which drops numbers to lowest whole integer
    case 1:
      return "#0000ff"; //blue means things are fine
    case 2:
      return "#00ff00"; //green means cause for concern
    case 3:
      return "#ffff00"; //yellow means you must put duct tape around your windows to remain safe
    case 4:
      return "#ffa500"; //orange means the earth is falling apart
    case 5:
      return "#ff0000"; //red means apocalypse
    default:
      return "#800080";
  }
}
//what's funny is, it was much easier to look up dynamic code on stack overflow than it was to look up, "add legend to leaflet"
//I wanted to do plain text so I could make a joke out of calling the different magnitudes funny things.
//
//fine
//rumble
//big rumble
//massive rumble
//doom
//
//Honestly, I'm coming to terms with the fact that code just isn't funny



// populate quake data on the map and also populate popup information
function populate_marker_data(earthquakeData) {
  var quakes = L.geoJson(earthquakeData,{
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag*5,
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5})//many examples online seem to rely on a heavy opacity, but at half
        //opaque, you can still see meaningful data in the multiple layers
        .bindPopup("<h3>" + "Location: " + feature.properties.place +
          "</h3><hr><p>" + "When: " + new Date (feature.properties.time) + "<br>" +//I think this datetime formatting looks awful, 
          //but the original "time" key in the USGS GeoJSON formatting is super verbose, and I am too tired to figure out how to 
          //reformat it.
          "Strength: " + feature.properties.mag + "</p>");
  }
});

  // build layers
  createMap(quakes);
}

function createMap(quakes) {

  // base layer, start in day mode
  var daymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: api_key
  }
  )
  //mapbox night mode, accessible through layer control checkbox
  var nightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: api_key
  }
  )

  // define a basemaps object to hold our base layers
  var baseMaps = {
    "Day Mode": daymap,
    "Night Mode": nightmap
  };

  // create overlay object to hold our overlay layer
  var overlayMaps = {
    quakes: quakes
  };

  // create map, center image so as to stick with our theme, "California but also Oklahoma"
  var myMap = L.map("map", {
    center: [40.00, -102.87],
    zoom: 5,
    layers: [daymap, quakes]
  });
    console.log(myMap);

//   Makes the toggle for the day layer/night layer
//   Pass in our baseMaps and overlayMaps
//   Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
   }).addTo(myMap);

  //Add legend to myMap map object
  legend.addTo(myMap);
}