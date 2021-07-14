const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require('path');

//import controlPoints.js file for processing raw data
var controlPointRoutes = require('./Routes/js/controlPoints');

const app = express();

//for static files like css, js
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/Report'));
app.use(express.static(__dirname + '/Routes'));

app.use(bodyParser.urlencoded({ extended: true}));

//main page
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

//report issue page
app.get('/report-issue', (req, res) => {
	res.sendFile(path.join(__dirname, 'Report', 'report_issue.html'));
});

//find safe route
app.get('/find-route', (req, res) => {
	res.sendFile(path.join(__dirname, 'Routes', 'find_route.html'));
});


//route to data used in controlPoints.js file
app.get('/crimeRecordsProcessed.json', (req, res) => {
	res.sendFile(path.join(__dirname, 'Data', 'crimeRecordsProcessed.json'));
});

app.get('/records_Processed.json', (req, res) => {
	res.sendFile(path.join(__dirname, 'Data', 'records_Processed.json'));

});

//display data on web page (for personal use)
app.get('/raw-data' ,(req, res) => {
	filePath = path.join(__dirname, 'Data', 'crimeRecordsRaw.json');
	res.sendFile(filePath);
});
app.get('/processed-data' ,(req, res) => {
	filePath = path.join(__dirname, 'Data', 'crimeRecordsProcessed.json');
	res.sendFile(filePath);
});
app.get('/records-data' ,(req, res) => {

	filePath = path.join(__dirname, 'Data', 'records_Processed.json');
	res.sendFile(filePath);

});

//handle form submission
app.post('/handleFormSubmit', (req, res) => {
	
	//path of json file
	rawDataFilePath = path.join(__dirname, 'Data', 'crimeRecordsRaw.json');
	processedDataFilePath = path.join(__dirname, 'Data', 'crimeRecordsProcessed.json');
	recordsDataFilePath = path.join(__dirname, 'Data', 'records_Processed.json');

	//convert 24 hr time to 12 hr time
	function tConvert (time) {
		  // Check correct time format and split into components
		  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

		  if (time.length > 1) { // If time format correct
			time = time.slice (1);  // Remove full string match value
			time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
			time[0] = +time[0] % 12 || 12; // Adjust hours
		  }
		  return time.join (''); // return adjusted time or original string
	}
	
    //save data in file
	fs.readFile(rawDataFilePath, (err, data) => {
		if (err) throw err;
		//console.log(data);
		var rawDataJS = JSON.parse(data);
		
		var newData = req.body;
		console.log(newData);
		
		//convert 24hr time to 12hr time
		var time24 = newData.time;
		time24 = time24.toString() + ':00';
		var time12 = tConvert(time24);
		newData.time = time12;

		rawDataJS.push(newData);

		//write raw data to file
		fs.writeFile(rawDataFilePath, JSON.stringify(rawDataJS, null, 3), err => {
			if(err) throw err;

			//return res.send("Success! Your post has been saved.");
		});
		
		//process the recieved data into usable form
		fs.readFile(processedDataFilePath, (err, data) => {
			if(err) throw err;
			
			var processedDataJS = JSON.parse(data);
			newDataProcessed = controlPointRoutes.getControlPointsData(newData);
			processedDataJS.push(newDataProcessed);
			
			//write data back to processed data file
			fs.writeFile(processedDataFilePath, JSON.stringify(processedDataJS, null, 3), err => {
				if(err) throw err;
				
				return res.send("Success! Your post has been saved.");
			});
		});

		fs.readFile(recordsDataFilePath, (err, data) => {
			if(err) throw err;
			
			var recordsDataJS = JSON.parse(data);
			newDataRecords = controlPointRoutes.getControlPointsData(newData);
			recordsDataJS.push(newDataProcessed);
			fs.writeFile(recordsDataFilePath, JSON.stringify(recordsDataJS, null, 3), err => {
				if(err) throw err;
				
				return res.send("Success! Your post has been saved.");
			});
		});
	});

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));