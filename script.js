var APIkey ='85577edceeeea73f289df86a132be521';
var city = 'Boulder'
var currentDate = moment().format('dddd, MMMM Do YYYY');
var currentDatePlusTime = moment().format('YYYY-MM-DD HH:MM:SS')

// Save users city searches in an array
var searchHistory = [];
$('.search').on("click", function (event) {
	event.preventDefault();
	city = $(this).parent('.btnPar').siblings('.textVal').val().trim();
	if (city === "") {return;};
	searchHistory.push(city);

	localStorage.setItem('city', JSON.stringify(searchHistory));
	forecastWeekEl.empty();
	getSearchHistory();
	getForecastToday();
});

// Define element for five day forecast
var forecastWeekEl = $('.forecastWeek');
// API Pull for weather in five day forecast
function getForecastWeek() {
	var getForecastWeekURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${APIkey}`;

	$.ajax({
		url: getForecastWeekURL,
		method: 'GET',
	}).then(function (response) {
		var weekArray = response.list;
		var myWeather = [];
		$.each(weekArray, function (index, value) {
			testObj = {
				currentDate: value.dt_txt.split(' ')[0],
				time: value.dt_txt.split(' ')[1],
				temp: value.main.temp,
				feels_like: value.main.feels_like,
				icon: value.weather[0].icon,
				humidity: value.main.humidity
			}

			if (value.dt_txt.split(' ')[1] === "12:00:00") {
				myWeather.push(testObj);
			}
		}) 
		for (let i = 0; i < myWeather.length; i++) {

			var divElCard = $('<div>');
			divElCard.attr('class', 'card text-white bg-primary mb-3 cardOne');
			divElCard.attr('style', 'max-width: 200px;');
			forecastWeekEl.append(divElCard);

			var divElHeader = $('<div>');
			divElHeader.attr('class', 'cardHeader')
			var m = moment(`${myWeather[i].currentDate}`).format('MM-DD-YYYY');
			divElHeader.text(m);
			divElCard.append(divElHeader)

			var divElBody = $('<div>');
			divElBody.attr('class', 'cardBody');
			divElCard.append(divElBody);

			var divElIcon = $('<img>');
			divElIcon.attr('class', 'forecastIcons');
			divElIcon.attr('src', `https://openweathermap.org/img/wn/${myWeather[i].icon}@2x.png`);
			divElBody.append(divElIcon);

			//Temp
			var pElTemperature = $('<p>').text(`Temperature: ${myWeather[i].temp} °F`);
			divElBody.append(pElTemperature);
			//Feels Like
			var pElFeelsLike = $('<p>').text(`Feels Like: ${myWeather[i].feels_like} °F`);
			divElBody.append(pElFeelsLike);
			//Humidity
			var pElHumidity = $('<p>').text(`Humidity: ${myWeather[i].humidity} %`);
			divElBody.append(pElHumidity);
		}
	});
};

//Assign forcastDetails(Body of card element)
var forecastDetails = $('.forecastDetails')
//Applies the weather data to the today card and then launches the five day forecast
function getForecastToday() {
	var getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIkey}`;

	$(forecastDetails).empty();

	$.ajax({
		url: getUrlCurrent,
		method: 'GET',
	}).then(function (response) {
		$('.forecastCity').text(response.name);
		$('.forecastDate').text(currentDate);
		//Set the cordinates for the searched city
        var cityLon = response.coord.lon;
        var cityLat = response.coord.lat;
        //Pull icon that alligns with forecast
		$('.forecastIcons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
		//Pull current temperature for city
		var pEl = $('<p>').text(`Temperature: ${response.main.temp} °F`);
		forecastDetails.append(pEl);
		//Pull feels like temperature to give users more accurate sense of weather
		var pElFeelsLike = $('<p>').text(`Feels Like: ${response.main.feels_like} °F`);
		forecastDetails.append(pElFeelsLike);
		//Let the users know how moist the ole air is
		var pElHumidity = $('<p>').text(`Humidity: ${response.main.humidity} %`);
		forecastDetails.append(pElHumidity);
		//Pull wind speed
		var pElWind = $('<p>').text(`Wind Speed: ${response.wind.speed} MPH`);
		forecastDetails.append(pElWind);

		var getUrlSunny = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=hourly,daily,minutely&appid=${APIkey}`;

		$.ajax({
			url: getUrlSunny,
			method: 'GET',
		}).then(function (response) {
			var pElUvi = $('<p>').text(`UV Index: `);
			var uviSpan = $('<span>').text(response.current.uvi);
			var uvi = response.current.uvi;
			pElUvi.append(uviSpan);
			forecastDetails.append(pElUvi);
			if (uvi >= 0 && uvi <= 2) {
				uviSpan.attr('class', 'green');
			} else if (uvi > 2 && uvi <= 5) {
				uviSpan.attr("class", "yellow")
			} else if (uvi > 5 && uvi <= 7) {
				uviSpan.attr("class", "red")
			} else {
				uviSpan.attr("class", "undefinedUVI")
			}
		});
	});
	getForecastWeek();
};

//Load page with example content to improve user experience and look of site
function sampleCity() {

	var searchHistoryStore = JSON.parse(localStorage.getItem('city'));

	if (searchHistoryStore !== null) {
		searchHistory = searchHistoryStore
	}
	getSearchHistory();
	getForecastToday();
};
// Call function above to display sample city on load
sampleCity();

// Convert Search History to clickable elements to improve user experience

function getSearchHistory() {
	var searchHistoryClickify = $('.searchHistory');
	searchHistoryClickify.empty();

	for (let i = 0; i < searchHistory.length; i++) {
		var rowEl = $('<row>');
		var btnEl = $('<button>').text(`${searchHistory[i]}`)
		rowEl.addClass('row histBtnRow');
		btnEl.addClass('btn btn-outline-secondary btn-block histBtn');
		btnEl.attr('type', 'button');
		searchHistoryClickify.prepend(rowEl);
		rowEl.append(btnEl);
	} if (!city) {
		return;
	}
	$('.histBtn').on("click", function (event) {
		event.preventDefault();
		city = $(this).text();
		forecastWeekEl.empty();
		getForecastToday();
	});
};