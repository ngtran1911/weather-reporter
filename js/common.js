console.log("this is common.js")

const BASE_URL = "https://api.open-meteo.com/v1/";

const URL_TEMP = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&hourly=temperature_2m,weather_code&current=temperature_2m&timezone=auto`;

const URL_CURRENT_WEATHER = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&current=weather_code&timezone=auto`;

async function fetchWeather(url) {
    console.log('Fetching ....')
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

