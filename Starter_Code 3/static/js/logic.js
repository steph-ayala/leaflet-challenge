const EARTHQUAKE_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const RADIUS_PARAMS = {
    GAIN: 5,
    MIN: 5,
}
const COLOR_PARAMS = {
    DEPTHS: [10, 30, 50, 70, 90],
    COLORS: ['#efbbff', '#d896ff', '#be29ec', '#800080', '#660066', '#440044']
}


var map = L.map('map').setView([42, -94.7138889], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// your data markers should reflect the magnitude of the earthquake by their size. Earthquakes with higher magnitudes should appear larger
function magToRadius(mag) { 
    let calculatedRadius = mag * RADIUS_PARAMS["GAIN"];
    let radius = Math.max(calculatedRadius, RADIUS_PARAMS["MIN"]);
    return radius;
}


// the depth of the earthquake by color. , and earthquakes with greater depth should appear darker in color.
function depthToColor(depth) { 
    if (depth < COLOR_PARAMS.DEPTHS[0]) {
        color = COLOR_PARAMS.COLORS[0];
    } else if (depth < COLOR_PARAMS.DEPTHS[1]) {
        color = COLOR_PARAMS.COLORS[1];   
    } else if (depth < COLOR_PARAMS.DEPTHS[2]) {
        color = COLOR_PARAMS.COLORS[2];   
    } else if (depth < COLOR_PARAMS.DEPTHS[3]) {
        color = COLOR_PARAMS.COLORS[3];
    } else if (depth < COLOR_PARAMS.DEPTHS[4]) {
        color = COLOR_PARAMS.COLORS[4];
    } else {
        color = COLOR_PARAMS.COLORS[5];
    }
    console.log(depth);
    return color;
}


function pointToLayer(feature, latlng) {
    let depth = feature["geometry"]["coordinates"][2];
    let mag = feature["properties"]["mag"];
    let circleMarkerOptions = {
        radius: magToRadius(mag),
        fillColor: depthToColor(depth),
        fillOpacity: 0.5,
        color: "black",
        weight: 1,
    };
    return L.circleMarker(latlng, circleMarkerOptions);
}


// Include popups that provide additional information about the earthquake when its associated marker is clicked.
function onEachFeature(feature, layer) {
    let html = `<h3>${feature.properties.place}</h3>`; 
    html += `<h5>${feature.properties.mag}</h5>`;
    html += `<p>${feature.properties.url}</p>`;
    layer.bindPopup(html);
}

function geoJSONCircleMarkers(geoJSONData) {
    // Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude. 
    const geoJSONOptions = {
        pointToLayer: pointToLayer,  
        onEachFeature: onEachFeature,
    };
    L.geoJSON(geoJSONData, geoJSONOptions).addTo(map);
}
d3.json(EARTHQUAKE_URL).then(geoJSONCircleMarkers);


// Create a legend that will provide context for your map data.
// Function to create and add the Depth Legend with the updated ranges
function addDepthLegend() {
    const depthLegend = L.control({ position: 'bottomright' });

    depthLegend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');

        // Define the custom depth ranges (updated based on your request)
        const depthRanges = [-10, 10, 30, 50, 70, 90]; // Custom ranges
        const colors = COLOR_PARAMS.COLORS; // Colors corresponding to each range
        const labels = [];

        // Loop through the custom depth ranges and create labels with corresponding colors
        for (let i = 0; i < depthRanges.length; i++) {
            // Create a label for each depth range
            let rangeStart = depthRanges[i];
            let rangeEnd = depthRanges[i + 1] || '∞';  // "∞" for the last range (90+ km)
            let labelText = (rangeEnd === '∞') ? `${rangeStart} +` : `${rangeStart} - ${rangeEnd} `;

            labels.push(
                `<i style="background: ${colors[i]}"></i> ${labelText}`
            );
        }

        // Set the inner HTML of the legend
        div.innerHTML = "<h4>Earthquake Depth (km)</h4>" + labels.join('<br>');

        // Return the div to be added to the map
        return div;
    };

    // Add the depth legend to the map
    depthLegend.addTo(map);
}

// Call the function to add the legend
addDepthLegend();




