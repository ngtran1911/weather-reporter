console.log("this is temperature.js");

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

function renderCurrentConditions(current, isDay) {
    setElementText('current-temp', `${current.temperature_2m}°C`);
    const iconEl = document.getElementById('weather-icon');
    if (iconEl) iconEl.innerHTML = getWeatherIcon(current.weather_code, isDay, 80);
}

function renderHourlyTable(hourly, currentHour, isDay) {
    const from = Math.max(0, currentHour - 20);

    let bodyRows = "";
    for (let i = from; i < currentHour; i++) {
        bodyRows += `<tr>
            <td>${hourly.time[i].slice(11, 16)}</td>
            <td>${getWeatherIcon(hourly.weather_code[i], isDay)}</td>
            <td>${hourly.temperature_2m[i]}°C</td>
        </tr>`;
    }

    const thead = document.querySelector("#forcast-24hours thead tr");
    if (thead) thead.innerHTML = "<th>Time</th><th>Condition</th><th>Temp</th>";
    const tbody = document.getElementById("weather-table-body");
    if (tbody) tbody.innerHTML = bodyRows;
}

function renderForecast(daily) {
    const container = document.getElementById("table-7days-forcast");
    if (!container) return;

    container.innerHTML = daily.time.map((date, i) => {
        const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
        return `<div class="forecast-item">
            <span class="day">${dayName}</span>
            <span class="icon">${getWeatherIcon(daily.weather_code[i], true, 32)}</span>
            <span class="degree"><b>${daily.temperature_2m_mean[i]}°C</b></span>
        </div>`;
    }).join('');
}

function renderAirConditions(current) {
    setElementText('real-feel',  current.apparent_temperature);
    setElementText('rain-chance', current.precipitation_probability);
    setElementText('wind-speed', current.wind_speed_10m);
    setElementText('uv-index',   current.uv_index);
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_TEMPERATURE_PAGE);
    if (!data) return;

    const currentHour = parseInt(data.current.time.slice(11, 13));
    const isDay = isDayTime(currentHour);

    renderCurrentConditions(data.current, isDay);
    renderHourlyTable(data.hourly, currentHour, isDay);
    renderForecast(data.daily);
    renderAirConditions(data.current);
});