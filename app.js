const apiKey = "a2ae961cb178870ab26416f5ba58ed0c";

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const dropdown = document.getElementById("recentCities");

searchBtn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    clearError();

    if (!city) {
        showError("Please enter a valid city name!");
        return;
    }

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
    .catch(error => {
        console.error("Fetch error:", error);
        showError("Something went wrong while fetching data.");
    });
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        displayWeather(data);
        fetchForecast(data.name);
    })
    .catch(error => {
        console.error("Location fetch error:", error);
        showError("Failed to fetch weather for your location.");
    });
}

function errorCallback(error) {
    let msg = "Unable to retrieve your location.";
    if (error.code === 1) msg = "Location access    denied.";
    else if (error.code === 2) msg = "Location    unavailable.";
    else if (error.code === 3) msg = "Request timed out.";
    showError(msg);
}

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

function fetchForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        displayForecast(data);
    })
    .catch(err => {
        console.error("Forecast error:", err);
    });
}

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

function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
      cities.unshift(city);
      if (cities.length > 5) cities.pop();
      localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    loadCities();
    
}
    
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

dropdown.addEventListener("change", () => {
    const selectedCity = dropdown.value;
    if (selectedCity) {
      document.getElementById("cityInput").value = selectedCity;
      searchBtn.click();
    }
});

function showError(message) {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = message;
}

function clearError() {
    document.getElementById("errorMsg").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    loadCities();
});