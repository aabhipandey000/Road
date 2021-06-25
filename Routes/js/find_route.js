var L, MQ, map, controlPointsData, rl, src, dst;

var data = getData();
data.then((data) => {
	console.log("######## Control Points Data ########");
	controlPointsData = data;
	console.log(controlPointsData);
	console.log("#####################################");

});

map = L.map('map', {
//layers: MQ.mapLayer(),
	center: [28.61073, 77.03827],
	zoom: 5
});
		
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hpdmFtZ2FyZ21hcGJveCIsImEiOiJjazZycm9uaDgwOGJ4M2VxaW5tYXp5ZGdzIn0.eORUyTlAxSmaXXP8j7o2zg', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox/streets-v11',
	tileSize: 512,
	zoomOffset: -1,
	accessToken: 'your.mapbox.access.token'
}).addTo(map);
		
// Adding a search bar in map
// This adds a scale to the map
L.control.scale().addTo(map);

//This add a Search bar
var searchControl = new L.esri.Controls.Geosearch({
	position: 'topleft',
	//expanded: true,
	useMapBounds: true,
	//collapseAfterResult: false,
	placeholder: 'GTBIT',
	title: 'Search'
}).addTo(map);

var results = new L.LayerGroup().addTo(map);

//add marker on searched location
searchControl.on('results', function(data){
	results.clearLayers();
	//console.log(data);
	//console.log(data.results.length);
	for (var i = data.results.length - 1; i >= 0; i--) {
		results.addLayer(L.marker(data.results[i].latlng));
	}
	
});


// Search bar for source location
var srcLocation = new L.esri.Controls.Geosearch({
	position: 'topright',
	placeholder: 'Search Source Address',
	label: 'Address Search',
	expanded: true,
	useMapBounds: true,
	collapseAfterResult: false
}).addTo(map);

// Add marker on searched location
srcLocation.on('results', function(data){
	results.clearLayers();
	src = data.results[0].latlng;
	document.getElementById('src').value = data.results[0].address;
	//console.log(data);
	//console.log(data.results.length);
	for (var i = data.results.length - 1; i >= 0; i--) {
		results.addLayer(L.marker(data.results[i].latlng));
	}
});
srcLocation.clear();

//search bar for destination location
var dstLocation = new L.esri.Controls.Geosearch({
	position: 'topright',
	placeholder: 'Search Destination Address',
	title: 'Destination',
	expanded: true,
	useMapBounds: true,
	collapseAfterResult: false
}).addTo(map);

//add marker on searched location
dstLocation.on('results', function(data){
	results.clearLayers();
	dst = data.results[0].latlng;
	document.getElementById('dst').value = data.results[0].address;
	//console.log(data);
	//console.log(data.results.length);
	for (var i = data.results.length - 1; i >= 0; i--) {
		results.addLayer(L.marker(data.results[i].latlng));
	}
	routeIt();
});

//function to find route
function routeIt() {
	//find narrative for route on success
	dir = MQ.routing.directions()
		.on('success', function(data) {
			var legs = data.route.legs,
				html = '',
				maneuvers,
				i;

			if (legs && legs.length) {
				maneuvers = legs[0].maneuvers;

				for (i=0; i < maneuvers.length; i++) {
					html += (i+1) + '. ';
					html += maneuvers[i].narrative + '<br>';
				}

				L.DomUtil.get('route-narrative').innerHTML = html;
			}
		});
		
	//get src and dst from map search bars
	if(src && dst)
	{	
		dir.route({
			locations: [
				{latLng: {lat: src.lat, lng: src.lng}},
				{latLng: {lat: dst.lat, lng: dst.lng}}
				//'28.671023, 77.15017',
				//'28.47978, 77.095177'
				// 28.671023 ; 77.15017   ; Raghav
				// 28.47978  ; 77.095177  ; Cheenu
				// 28.673561 ; 77.140227  ; Punjabi Chowk Coordinates.   
			],
			options: {
				routeControlPointCollection: controlPointsData
			}
		});
		src = dst = undefined;
	}
	//else get src and dst values from input boxes of our page as names
	//and lets its geocoder find coordinates by itself in finding route
	else
	{
		src = document.getElementById('src').value;
		dst = document.getElementById('dst').value;
		
		dir.route({
			locations: [
				src,
				dst
				//{latLng: {lat: src.lat, lng: src.lng}},
				//{latLng: {lat: dst.lat, lng: dst.lng}}
				//'28.671023, 77.15017',
				//'28.47978, 77.095177'
				// 28.671023 ; 77.15017   ; Raghav
				// 28.47978  ; 77.095177  ; Cheenu
				// 28.673561 ; 77.140227  ; Punjabi Chowk Coordinates.   
			],
			options: {
				routeControlPointCollection: controlPointsData
			}
		});
		src = dst = undefined;
	}

	if (rl) {
		map.removeLayer(rl);
	}

	rl = MQ.routing.routeLayer({
		directions: dir,
		fitBounds: true
	}); 
	map.addLayer(rl);
	console.log("Direction Set and layer added.");
}