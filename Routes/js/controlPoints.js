
// The function returns the processed control points to be used in finding route
function getData(){
	//url of json data file 
	const url = 'crimeRecordsProcessed.json';
	
	//make an api call to the file (get request) using fetch
	return fetch(url)
		.then((resp) => resp.json()) // Transform the data into json
		.then(function(data) {
			return data;
		});
}

// function getDataRaw(){
// 	//url of json data file 
// 	const url = 'crimeRecordsRaw.json';
	
// 	//make an api call to the file (get request) using fetch
// 	return fetch(url)
// 		.then((resp) => resp.json()) // Transform the data into json
// 		.then(function(data) {
// 			return data;
// 		});
// }

// set weights for crimes.
function getWeights() {
    var myWeights = {
    	"abduction": 10,
    	"rape": 15,
    	"eveTeasing":9,
		"stalking": 9,
    	"streetHarassment": 11,
    	"assaultOnWomen": 11,
    	"humanTrafficking": 10,
    	"theft": 8,
    	"acidAttack": 15
    };

    return myWeights;
}

function withinRange(rangeInMinutes, time){
	// var today = (new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))).toLocaleString(); 
	// console.log(today);
	var today = new Date();
	var cmins = today.getMinutes() + today.getHours()*60;
	var mins;
	// console.log(time);
	if (time.substring(1,2)==":"){
		mins = parseInt(time.substring(2,4)) + parseInt(time.substring(0,1))*60;
		if (time.substring(7,9)=="PM"){
			mins += 12*60;
		}
	} else {
		mins = parseInt(time.substring(3,5)) + parseInt(time.substring(0,2))*60;
		if (time.substring(8,10)=="PM"){
			mins += 12*60;
		}
	}

	// console.log("CTime -> "+cmins+" ETime ->"+mins);

	if (Math.abs(mins-cmins) <= rangeInMinutes){
		return 1;
	} else if ((Math.abs(mins-cmins)<=24*60) && (Math.abs(mins-cmins)>=((24*60) - rangeInMinutes))){
		return 1;
	} else {
		return 0;
	}
}

function calculateWeight(tag, intensity, time) {
	var tags = getWeights();
	var weight = tags[tag];

	if (intensity == 1){
		weight *= 1;
	} else if (intensity == 2){
		weight *= 1.2;
	} else if (intensity == 3){
		weight *= 1.5;
	} else if (intensity == 4){
		weight *= 1.8;
	} else if (intensity == 5){
		weight *= 2.0;
	}

	var rangeForTimeComparisonInMinutes = 180;
	if (withinRange(rangeForTimeComparisonInMinutes, time)!=0){
		weight *= 1.2;
	}

	// console.log("***** To check weight calculations ******");
	// console.log(weight);
	// console.log("*****************************************");

	return weight;
}

module.exports = {
	getControlPointsData: function(data){

			// Preparing controlPoint record.
			var controlPoint = {
				"lat": data.latitude,
				"lng": data.longitude,
				"weight": calculateWeight(data.crimeTag, data.intensity, data.time),
				"radius": (data.radius) * 0.621371,  // Mutilplying 0.621371 for miles
				"crimeTag": data.crimeTag,
				"intensity": data.intensity 
			}
		return controlPoint; 
	}
};

