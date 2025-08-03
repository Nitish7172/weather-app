// Get DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const weatherInfo = document.getElementById('weatherInfo');
const cityNameElem = document.getElementById('cityName');
const temperatureElem = document.getElementById('temperature');
const weatherDescriptionElem = document.getElementById('weatherDescription');
const humidityElem = document.getElementById('humidity');
const windSpeedElem = document.getElementById('windSpeed');

// Function to show/hide elements
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

// Function to display error message
function displayError(message) {
    errorMessage.textContent = message;
    showElement(errorMessage);
    hideElement(loadingSpinner);
    hideElement(weatherInfo);
}

// Function to clear error message
function clearError() {
    hideElement(errorMessage);
}

// Function to fetch weather data
async function getWeatherData(city) {
    clearError();
    showElement(loadingSpinner);
    hideElement(weatherInfo);

    try {
        // Step 1: Geocoding - Convert city name to coordinates
        // Using Open-Meteo's Geocoding API to get latitude and longitude from a city name.
        const geoApiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
        const geoResponse = await fetch(geoApiUrl);
        const geoData = await geoResponse.json();

        // Check if the geocoding request was successful and returned results.
        if (!geoResponse.ok || !geoData.results || geoData.results.length === 0) {
            displayError('City not found. Please try again.');
            return;
        }

        // Extract latitude and longitude from the first result.
        const { latitude, longitude } = geoData.results[0];

        // Step 2: Fetch weather data using coordinates
        // Using Open-Meteo's Forecast API to get current weather based on coordinates.
        // Requesting current weather, temperature in Celsius, wind speed in km/h, and precipitation in mm.
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm`;
        const weatherResponse = await fetch(weatherApiUrl);
        const weatherData = await weatherResponse.json();

        // Check if the weather data request was successful and contains current weather.
        if (!weatherResponse.ok || !weatherData.current_weather) {
            displayError('Failed to fetch weather data. Please try again later.');
            return;
        }

        // Extract relevant weather data.
        const { temperature, windspeed, weathercode } = weatherData.current_weather;
        // Map the weather code to a human-readable description.
        const weatherDescription = getWeatherDescription(weathercode);

        // Update the DOM elements with the fetched weather information.
        cityNameElem.textContent = geoData.results[0].name;
        temperatureElem.textContent = `${Math.round(temperature)}°C`;
        weatherDescriptionElem.textContent = weatherDescription;
        // Open-Meteo's current_weather endpoint does not directly provide humidity.
        // A placeholder "N/A%" is used here. For actual humidity, a different API endpoint
        // or a different weather API would be needed.
        humidityElem.textContent = 'N/A%'; // Placeholder for humidity
        windSpeedElem.textContent = `${windspeed} km/h`;

        // Hide loading spinner and show weather information.
        hideElement(loadingSpinner);
        showElement(weatherInfo);

    } catch (error) {
        // Log any errors to the console and display a user-friendly error message.
        console.error('Error fetching weather data:', error);
        displayError('An error occurred. Please check your internet connection or try again.');
        hideElement(loadingSpinner);
    }
}

// Helper function to map Open-Meteo weather codes to descriptive strings.
// A comprehensive list of WMO weather interpretation codes can be found in the Open-Meteo documentation.
function getWeatherDescription(code) {
    switch (code) {
        case 0: return 'Clear sky';
        case 1: return 'Mostly clear';
        case 2: return 'Partly cloudy';
        case 3: return 'Overcast';
        case 45: return 'Fog';
        case 48: return 'Depositing rime fog';
        case 51: return 'Drizzle: Light';
        case 53: return 'Drizzle: Moderate';
        case 55: return 'Drizzle: Dense intensity';
        case 56: return 'Freezing Drizzle: Light';
        case 57: return 'Freezing Drizzle: Dense intensity';
        case 61: return 'Rain: Slight';
        case 63: return 'Rain: Moderate';
        case 65: return 'Rain: Heavy intensity';
        case 66: return 'Freezing Rain: Light';
        case 67: return 'Freezing Rain: Heavy intensity';
        case 71: return 'Snow fall: Slight';
        case 73: return 'Snow fall: Moderate';
        case 75: return 'Snow fall: Heavy intensity';
        case 77: return 'Snow grains';
        case 80: return 'Rain showers: Slight';
        case 81: return 'Rain showers: Moderate';
        case 82: return 'Rain showers: Violent';
        case 85: return 'Snow showers: Slight';
        case 86: return 'Snow showers: Heavy';
        case 95: return 'Thunderstorm: Slight or moderate';
        case 96: return 'Thunderstorm with slight hail';
        case 99: return 'Thunderstorm with heavy hail';
        default: return 'Unknown';
    }
}

// Event listener for the search button click.
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim(); // Get the city name from the input field and remove whitespace.
    if (city) {
        getWeatherData(city); // If a city name is provided, fetch weather data.
    } else {
        displayError('Please enter a city name.'); // Otherwise, display an error.
    }
});

// Event listener to allow searching by pressing the Enter key in the input field.
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click(); // Simulate a click on the search button.
    }
});

// Optional: Fetch weather for a default city when the window loads.
window.onload = () => {
     // Uncomment the line below and replace 'London' with your desired default city
     // to have weather displayed automatically on page load.
     // getWeatherData('London');
};
