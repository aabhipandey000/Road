//remember last position
var rememberLat = document.getElementById('latitude').value;
var rememberLong = document.getElementById('longitude').value;
if( !rememberLat || !rememberLong ) { rememberLat = 28.61220235677631; rememberLong = 77.0336651802063;}

//delhi coordinates
var map = L.map('map',{
	center: [rememberLat, rememberLong],
	zoom: 16
});
	
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hpdmFtZ2FyZ21hcGJveCIsImEiOiJjazZycm9uaDgwOGJ4M2VxaW5tYXp5ZGdzIn0.eORUyTlAxSmaXXP8j7o2zg', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox/streets-v11',
	tileSize: 512,
	zoomOffset: -1,
	accessToken: 'your.mapbox.access.token'
}).addTo(map);

var marker = L.marker([rememberLat, rememberLong],{
  draggable: true
}).addTo(map);

// This add a scale to the map
L.control.scale().addTo(map);

//This add a Search bar
var searchControl = new L.esri.Controls.Geosearch({
	position: 'topright',
	expanded: true,
	useMapBounds: true,
	collapseAfterResult: false,
	placeholder: 'NSIT',
	title: 'Search',
}).addTo(map);

var results = new L.LayerGroup().addTo(map);

searchControl.on('results', function(data){
	results.clearLayers();
	//console.log(data);
	//console.log(data.results[0]);
	/*
	for (var i = data.results.length - 1; i >= 0; i--) {
		results.addLayer(L.marker(data.results[i].latlng));
	}
	*/
	//update marker coordinates
	marker.setLatLng(data.results[0].latlng);
	updateLatLng(marker.getLatLng().lat, marker.getLatLng().lng);
});

marker.on('dragend', function (e) {
	updateLatLng(marker.getLatLng().lat, marker.getLatLng().lng);
});

map.on('click', function (e) {
	marker.setLatLng(e.latlng);
	updateLatLng(marker.getLatLng().lat, marker.getLatLng().lng);
});

function updateLatLng(lat,lng,reverse) {
	if(reverse) {
		marker.setLatLng([lat,lng]);
		map.panTo([lat,lng]);
	} else {
		document.getElementById('latitude').value = marker.getLatLng().lat;
		document.getElementById('longitude').value = marker.getLatLng().lng;
		map.panTo([lat,lng]);
	}
}

//function to validate form
function validateForm()
{
	console.log('Validating form');
	//radius must be floating point
	var rad = document.forms['formIssue']['radius'].value;
	if(isNaN(rad))
	{
		alert('Please enter a valid radius');
		return false;
	}	
}