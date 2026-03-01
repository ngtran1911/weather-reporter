console.log("this is temperature.js");

function getCurrentHour() {
    return new Date().getHours();
}

function isDayTime(hour) {
    return hour >= 6 && hour < 17;
}

function getWeatherIcon(code, isDay = true, size = 32) {
    const WEATHER_ICONS = {
        0:  { icon: isDay ? 'sunny' : 'clear-night',                           alt: 'Clear sky' },
        1:  { icon: isDay ? 'cloudy-clear-times' : 'cloudy-clear-times-night', alt: 'Mainly clear' },
        2:  { icon: isDay ? 'partly-cloudy' : 'partly-cloudy-night',           alt: 'Partly cloudy' },
        3:  { icon: 'cloudy',                                                   alt: 'Overcast' },
        45: { icon: 'fog',                                                      alt: 'Fog' },
        48: { icon: 'fog',                                                      alt: 'Depositing rime fog' },
        51: { icon: isDay ? 'drizzle-sun' : 'drizzle-night',                   alt: 'Light drizzle' },
        53: { icon: 'drizzle',                                                  alt: 'Moderate drizzle' },
        55: { icon: 'drizzle',                                                  alt: 'Dense drizzle' },
        56: { icon: 'drizzle-night',                                            alt: 'Light freezing drizzle' },
        57: { icon: 'drizzle-night',                                            alt: 'Dense freezing drizzle' },
        61: { icon: isDay ? 'rain-sun' : 'rain-night',                         alt: 'Slight rain' },
        63: { icon: isDay ? 'scatterad-showers' : 'scatterad-showers-night',   alt: 'Moderate rain' },
        65: { icon: 'heavy-rain',                                               alt: 'Heavy rain' },
        66: { icon: 'sleet',                                                    alt: 'Light freezing rain' },
        67: { icon: 'sleet',                                                    alt: 'Heavy freezing rain' },
        71: { icon: 'snow',                                                     alt: 'Slight snow fall' },
        73: { icon: 'snow',                                                     alt: 'Moderate snow fall' },
        75: { icon: 'blizzard',                                                 alt: 'Heavy snow fall' },
        77: { icon: 'hail',                                                     alt: 'Snow grains' },
        80: { icon: isDay ? 'scatterad-showers' : 'scatterad-showers-night',   alt: 'Slight rain showers' },
        81: { icon: isDay ? 'rain-sun' : 'rain-night',                         alt: 'Moderate rain showers' },
        82: { icon: 'heavy-rain',                                               alt: 'Violent rain showers' },
        85: { icon: 'blowing-snow',                                             alt: 'Slight snow showers' },
        86: { icon: 'blizzard',                                                 alt: 'Heavy snow showers' },
        95: { icon: 'scatterad-thunderstorm',                                   alt: 'Thunderstorm' },
        96: { icon: 'rain-thunderstorm',                                        alt: 'Thunderstorm with slight hail' },
        99: { icon: 'sever-thunder',                                            alt: 'Thunderstorm with heavy hail' },
    };

    const { icon, alt } = WEATHER_ICONS[code] ?? { icon: 'cloudy', alt: 'Unknown' };
    return `<img src="assets/weather/${icon}.png" alt="${alt}" title="${alt}" width="${size}" height="${size}"/>`;
}

function forecastTemplate(day, temperature, iconHtml) {
    return `
        <div class="forecast-item">
            <span class="day">${day}</span>
            <span class="icon">${iconHtml}</span>
            <span class="degree"><b>${temperature}°C</b></span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_TEMPERATURE_PAGE);

    const currentHour = parseInt(data.current.time.slice(11, 13));
    const isDay = isDayTime(currentHour);

    document.getElementById("current-temp").innerHTML = `${data.current.temperature_2m}°C`;
    document.getElementById("weather-icon").innerHTML = getWeatherIcon(data.current.weather_code, isDay, 80);

    const hours = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weather_code;

    const from = currentHour - 20;
    const start = from >= 0 ? from : 0;

    let bodyRows = "";
    for (let i = start; i < currentHour; i++) {
        bodyRows += `<tr>
            <td>${hours[i].slice(11, 16)}</td>
            <td>${getWeatherIcon(codes[i], isDay)}</td>
            <td>${temps[i]}°C</td>
        </tr>`;
    }
    document.querySelector("#forcast-24hours thead tr").innerHTML = "<th>Time</th><th>Condition</th><th>Temp</th>";
    document.getElementById("weather-table-body").innerHTML = bodyRows;

    let daysForecast = "";
    for (let i = 0; i < data.daily.time.length; i++) {
        const dayName = new Date(data.daily.time[i]).toLocaleDateString("en-US", { weekday: "short" });
        daysForecast += forecastTemplate(dayName, data.daily.temperature_2m_mean[i], getWeatherIcon(data.daily.weather_code[i], true, 32));
    }
    document.getElementById("table-7days-forcast").innerHTML = daysForecast;

    document.getElementById("real-feel").innerHTML = data.current.apparent_temperature;
    document.getElementById("rain-chance").innerHTML = data.current.precipitation_probability;
    document.getElementById("wind-speed").innerHTML = data.current.wind_speed_10m;
    document.getElementById("uv-index").innerHTML = data.current.uv_index;
});