function getForecast()
{
	var city = document.getElementById("city").value;
	var api_key = '5fa00b9b1a4dbce90f47282dd8d58ca7';
	var units = document.getElementsByName("temperature_unit");
	var temperature;
	var icon;
	var isInFahrenheit;
	

	//var url = 'http://api.openweathermap.org/data/2.5/weather?q=Montreal,ca&units=imperial&APPID=' + api_key;
	var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + ',ca&units=' + units[0].value + '&APPID=' + api_key;

	var json_obj = JSON.parse(GetJSONText(url));
	
	//convert temperature from Kelvin to Celsius or Fahrenheit 
	var kelvin = json_obj.main.temp;

	var main_weather_condition = json_obj.weather[0].main;
	var weather_condition = json_obj.weather[0].description;

	//fahrenheit
	if(units[0].checked)
	{
		isInFahrenheit = true;
	}

	//celsius
	else
	{
		isInFahrenheit = false;
	}

	if(isInFahrenheit)
	{
		
		temperature = parseInt(kelvin * (9/5) - 459.67);
		units = '\xB0' + 'F';
	}

	else
	{
		temperature = parseInt(kelvin - 273.15);
		units = '\xB0' + 'C';
	}


	

	//determine the weather icon	
	icon = getIcon(main_weather_condition, weather_condition);

	
	//current weather forecast
	document.getElementById("current_forecast").innerHTML = "<h3>Current Forecast</h3><p>" + json_obj.name + "</p>" 
	+ "<p>" + weather_condition + "</p>" 
	+ "<img src='weather_icons/" + icon + "' height='80' width='80'>"
	+ "<p>" + temperature + " " + units + "</p>" 
	+ "<p>Humidity: " + json_obj.main.humidity + "%</p>"
	+ "<p>Wind: " + json_obj.wind.speed + " m/s</p>";


	//5 day weather forecast
	
	url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + city + ',ca&units=' + units[0].value + '&mode=xml&APPID=' + api_key;

	//parse xml
	var xmlDoc = GetXML(url);


	var x = xmlDoc.getElementsByTagName("time");
	var txt = "";
	var currentDate = new Date();


	var currentDateString = getDateString(currentDate);



	var nextDates = new Array();
	var timeTags = new Array();

	for(var j = 0; j < 5; j++)
	{
		nextDates[j] = new Date();
		nextDates[j].setDate(currentDate.getDate()+j+1);
	}



	
	var timeTagCount = 0;
	//get and read time tags of next 5 days
	for(var i = 0; i < x.length; i++)
	{
		if(timeTagCount == 5)
			break;

		//get time tags of next five days
		var timeTagDate = x[i].getAttribute("from");

		if(timeTagDate.indexOf(getDateString(nextDates[timeTagCount])) != -1)
		{
			timeTags[timeTagCount] = x[i];
			timeTagCount += 1;
		}

	}

	document.getElementById("5_day_forecast").innerHTML = "<h3>Forecast for the next 5 days</h3>";

	//print time tags - dates, icons, temperatures (at midnight, kelvin to degree fahrenheit/celsius)
	for(var k = 0; k < timeTags.length; k++)
	{
		var kelvin = parseFloat(timeTags[k].childNodes[4].getAttribute("value"));

		//fahrenheit
		if(isInFahrenheit)
		{			
			temperature = parseInt(kelvin * (9/5) - 459.67);
			temperature += '\xB0' + 'F';
		}

		//celsius
		else
		{
			temperature = parseInt(kelvin - 273.15);
			temperature += '\xB0' + 'C';
		}

		icon = xmlGetIcon(timeTags[k].childNodes[0].getAttribute("name"));


		var dateString = getDateString2(nextDates[k]);
		
		
		document.getElementById("5_day_forecast").innerHTML += "<div class='nextDayForecast'>" + dateString + "<br><img src='weather_icons/" + icon + "' height='60' width='60'><br>" + temperature + "<br><br></div>";
	
	}


	document.getElementById("3_hour_forecast").innerHTML = "<br><br><br><br><br><br><hr><h3>Forecast per 3 hours</h3>";


	//get and read 5 time tags for next 5 3-hours 
	for(var i = 0; i < 5; i++)
	{
		//read the time from the time tag's from attribute
		var temperature;
		var timeTagFrom = x[i].getAttribute("from");
		var fromArray = timeTagFrom.split("T");
		var time = fromArray[1];

		var kelvin = parseFloat(x[i].childNodes[4].getAttribute("value"));

		//fahrenheit
		if(isInFahrenheit)
		{			
			temperature = parseInt(kelvin * (9/5) - 459.67);
			temperature += '\xB0' + 'F';
		}

		//celsius
		else
		{
			temperature = parseInt(kelvin - 273.15);
			temperature += '\xB0' + 'C';
		}

		time = getFormattedTime(time);

	
		document.getElementById("3_hour_forecast").innerHTML += "<div class='nextTimeForecast'><strong>" + time + "</strong><hr>" + temperature + "</div>";
	}

	
}

function getFormattedTime(fourDigitTime){
    var hours24 = parseInt(fourDigitTime.substring(0,2), 10);
    var hours = ((hours24 + 11) % 12) + 1;
    var amPm = hours24 > 11 ? 'PM' : 'AM';

    return hours + ' ' + amPm;
};

//input: string from XML for weather condition
//returns icon file name 
function xmlGetIcon(weather_condition)
{
	var icon;

	if( (weather_condition.search(/clear/i) != -1) || (weather_condition.search(/sunny/i) != -1) || (weather_condition.search(/clear/i) != -1) )
	{
		icon = "Sunny.png";
	}

	else if ((weather_condition.search(/few clouds/i) != -1))
	{
		icon = "Mostly Cloudy.png";
	}

	else if ((weather_condition.search(/scattered clouds/i) != -1) || (weather_condition.search(/broken clouds/i) != -1))
	{
		icon = "Cloudy.png";
	}


	else if ((weather_condition.search(/rain/i) != -1))
	{
		icon = "Drizzle.png";
	}

	else if ((weather_condition.search(/storm/i) != -1))
	{
		icon = "Thunderstorms.png";
	}

	else if ((weather_condition.search(/snow/i) != -1))
	{
		icon = "Snow.png";
	}

	else if ((weather_condition.search(/mist/i) != -1))
	{
		icon = "Haze.png";
	}

	else
	{
		icon = "";
	}

	return icon;
}

//input: strings from JSON for weather conditions  
//returns icon file name 
function getIcon(main_weather_condition, weather_condition)
{
	var icon;

	if( (main_weather_condition.search(/clear/i) != -1) || (main_weather_condition.search(/sunny/i) != -1) || (weather_condition.search(/clear/i) != -1) )
	{
		icon = "Sunny.png";
	}

	else if ((weather_condition.search(/few clouds/i) != -1))
	{
		icon = "Mostly Cloudy.png";
	}

	else if ((weather_condition.search(/scattered clouds/i) != -1) || (weather_condition.search(/broken clouds/i) != -1))
	{
		icon = "Cloudy.png";
	}

	else if ((weather_condition.search(/shower rain/i) != -1))
	{
		icon = "Drizzle.png";
	}

	else if ((weather_condition.search(/rain/i) != -1))
	{
		icon = "Slight Drizzle.png";
	}

	else if ((weather_condition.search(/thunderstorm/i) != -1))
	{
		icon = "Thunderstorms.png";
	}

	else if ((weather_condition.search(/snow/i) != -1))
	{
		icon = "Snow.png";
	}

	else if ((weather_condition.search(/mist/i) != -1))
	{
		icon = "Haze.png";
	}

	else
	{
		icon = "";
	}

	return icon;
}

//input: Date object
//returns a string in the format year-month-day
function getDateString(date)
{
	var month = date.getMonth() + 1;

	if(month < 10)
	{
		month = "0" + month;
	}

	return date.getFullYear() + "-" + month + "-" + date.getDate();
}

//date format: day of week, month day, year
function getDateString2(date)
{
	var daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var dayOfWeek = daysOfWeek[date.getDay()];

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var month = months[date.getMonth()];

	return dayOfWeek + ", " + month + " " + date.getDate() + ", " + date.getFullYear();
}

function GetJSONText(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

function GetXML(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseXML;          
}
