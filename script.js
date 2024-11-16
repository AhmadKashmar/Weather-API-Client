const API_BASE_URL = "http://localhost:5203/api";

const citySelect = document.getElementById("citySelect");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");
const errorMessage = document.getElementById("errorMessage");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");

let currentPage = 1;
const pageSize = 50;
let totalPages = 4;

prevPageBtn.addEventListener("click", () => {
	if (currentPage > 1) {
		currentPage--;
		fetchCities(currentPage);
	}
});

nextPageBtn.addEventListener("click", () => {
	if (currentPage < totalPages) {
		currentPage++;
		fetchCities(currentPage);
	}
});

getWeatherBtn.addEventListener("click", () => {
	const selectedCity = citySelect.value;
	if (selectedCity) {
		fetchWeather(selectedCity);
	} else {
		displayError("Please select a city.");
	}
});

document.addEventListener("DOMContentLoaded", () => {
	fetchCities(currentPage);
});

/**
 * Fetches a paginated list of cities from the API.
 * @param {number} page - The page number to fetch.
 */
async function fetchCities(page) {
	clearMessages();
	displayMessage("Loading cities...");

	try {
		const response = await fetch(
			`${API_BASE_URL}/cities?pageNumber=${page}&pageSize=${pageSize}`
		);

		if (!response.ok) {
			throw new Error(
				`Error fetching cities: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		totalPages = data.totalPages;
		currentPage = data.pageNumber;
		currentPageSpan.textContent = `Page ${data.pageNumber} of ${data.totalPages}`;

		prevPageBtn.disabled = page === 1;
		nextPageBtn.disabled = page === totalPages;

		populateCitySelect(data.data);

		citySelect.disabled = false;
		getWeatherBtn.disabled = false;
		clearMessages();
	} catch (error) {
		console.error(error);
		displayError("Failed to load cities. Please try again later.");
	}
}

/**
 * Populates the city select dropdown with fetched cities.
 * @param {Array} cities - The array of city objects.
 */
function populateCitySelect(cities) {
	citySelect.innerHTML = '<option value="" disabled selected>Select a city</option>';

	cities.forEach((city) => {
		const option = document.createElement("option");
		option.value = city.name;
		option.textContent = `${city.name}, ${city.country}`;
		citySelect.appendChild(option);
	});
}

/**
 * Fetches weather data for the selected city from the API.
 * @param {string} cityName - The name of the city.
 */
async function fetchWeather(cityName) {
	clearMessages();
	displayMessage("Fetching weather data...");

	try {
		const response = await fetch(
			`${API_BASE_URL}/weather?city=${encodeURIComponent(cityName)}`
		);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error("City not found.");
			} else {
				throw new Error(
					`Error fetching weather: ${response.status} ${response.statusText}`
				);
			}
		}

		const data = await response.json();

		displayWeather(data);
	} catch (error) {
		console.error(error);
		displayError(
			error.message || "Failed to fetch weather data. Please try again later."
		);
	}
}

/**
 * Displays the weather data in the UI.
 * @param {Object} data - The weather data object.
 */
function displayWeather(data) {
	weatherResult.innerHTML = `
        <h2>Weather in ${data.city}</h2>
        <p><strong>Temperature:</strong> ${data.temperature}</p>
        <p><strong>Description:</strong> ${capitalizeFirstLetter(data.description)}</p>
        <p><strong>Humidity:</strong> ${data.humidity}</p>
        <p><strong>Wind Speed:</strong> ${data.windSpeed}</p>
    `;
}

/**
 * Displays an error message in the UI.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
	errorMessage.textContent = message;
}

/**
 * Displays a loading message in the UI.
 * @param {string} message - The loading message to display.
 */
function displayMessage(message) {
	weatherResult.innerHTML = `<p>${message}</p>`;
}

/**
 * Clears weather results and error messages.
 */
function clearMessages() {
	weatherResult.innerHTML = "";
	errorMessage.textContent = "";
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
