// Weather API key 
const apiKey = "a2ae961cb178870ab26416f5ba58ed0c";

// Search Location Button 
const searchBtn = document.getElementById("searchBtn");

// Current Location Button
const locationBtn = document.getElementById("locationBtn");

// Recently searched locations displayed
const dropdown = document.getElementById("recentCities");

// An event is added on click of Search button 
// trim() - removes white spaces 
searchBtn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    clearError();

    // Error handling by displaying an error message
    if (!city) {
        showError("Please enter a valid city name!");
        return;
    }

    // fetching and displaying weather data from OpenWeather using the API key for the searched location 
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}
    `)
    .then(response => response.json())
    .then(data => {
        if (data.cod === "404") {
            showError("City not found! Try again.");
            return;
        }
        displayWeather(data);
        saveCity(city);
        fetchForecast(city);
    })
    .catch(error => {  // Error handling
        console.error("Fetch error:", error);
        showError("Something went wrong while fetching data.");
    });
});

//  An event is added on click of Current Location button 
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {  // Error handling
        showError("Geolocation is not supported by your browser.");
    }
});

// fetching and displaying weather data from OpenWeather using the API key for the current location
function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        displayWeather(data);
        fetchForecast(data.name);
    })
    .catch(error => {  // Error handling
        console.error("Location fetch error:", error);
        showError("Failed to fetch weather for your location.");
    });
}

function errorCallback(error) {  // Error handling
    let msg = "Unable to retrieve your location.";
    if (error.code === 1) msg = "Location access    denied.";
    else if (error.code === 2) msg = "Location    unavailable.";
    else if (error.code === 3) msg = "Request timed out.";
    showError(msg);
}

// Displaying weather data fetched - Temperature, humidity, wind speed
function displayWeather(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; 
    document.getElementById("temperature").innerHTML =
    `<img src="${iconUrl}" alt="icon" class="inline w-8 h-8 mr-1"> Temperature: ${data.main.temp}°C`; 
    document.getElementById("humidity").innerHTML =
    `<i class="fa-solid fa-droplet"></i> Humidity: ${data.main.humidity}%`; 
    document.getElementById("windSpeed").innerHTML =
    `<i class="fa-solid fa-wind"></i> Wind Speed: ${data.wind.speed} m/s`;
}

// fetching forecast data 
function fetchForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        displayForecast(data);
    })
    .catch(err => {  // Error handling
        console.error("Forecast error:", err);
    });
}

// displaying forecasted data 
function displayForecast(data) {
    const forecastContainer = document.getElementById("forecastCards");
    forecastContainer.innerHTML = "";

    const forecastMap = new Map();
    data.list.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!forecastMap.has(date) && entry.dt_txt.includes("12:00:00")) {
        forecastMap.set(date, entry);
      }
    });

    const forecastList = Array.from(forecastMap.values()).slice(0, 5);

    forecastList.forEach(entry => {
        const card = document.createElement("div");
        card.className = "bg-blue-100 p-3 rounded shadow text-sm sm:text-base";

        // Weather icons for forecast display 
        const iconCode = entry.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const date = new Date(entry.dt_txt);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        
        card.innerHTML = `
          <h3 class="font-bold text-md">${date.toLocaleDateString(undefined, options)}</h3>
          <img src="${iconUrl}" alt="icon" class="w-10 h-10 mx-auto">
          <p><i class="fa-solid fa-temperature-half"></i> ${entry.main.temp}°C</p>
          <p>${entry.weather[0].main}</p>
          <p><i class="fa-solid fa-wind"></i> ${entry.wind.speed} m/s</p>`;
          
        forecastContainer.appendChild(card);
    });
}

// saving previously searched locations using localStorage
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
      cities.unshift(city);
      if (cities.length > 5) cities.pop();
      localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    loadCities();
    
}
    
// displaying previously searched locations - Recently Searched 
function loadCities() {
    const dropdown = document.getElementById("recentCities");
    dropdown.innerHTML = `<option value="">-- Recently Searched --</option>`;
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
}

// Adding previously searched locations to the Recently Searched dropdown 
dropdown.addEventListener("change", () => {
    const selectedCity = dropdown.value;
    if (selectedCity) {
      document.getElementById("cityInput").value = selectedCity;
      searchBtn.click();
    }
});

function showError(message) {  // Error handling
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = message;
}

function clearError() { // Error message is cleared when correct input is given 
    document.getElementById("errorMsg").textContent = "";
}

// waits for the HTML code to be completely loaded for Js interaction 
document.addEventListener("DOMContentLoaded", () => {
    loadCities();
});