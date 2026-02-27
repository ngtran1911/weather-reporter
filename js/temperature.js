console.log("this is temperature.js")


function getCurrentHour(){
    const now = new Date();
    const currentHour = now.getHours();
    console.log("time now " + currentHour);
    return currentHour;
}

function isDayTime(currentHour){
    return currentHour >= 6 && currentHour < 17;
}

async function renderForcastWeather() {
    const info = await fetchWeather(URL_TEMP);

    const hours = info.hourly.time;
    const temps = info.hourly.temperature_2m;
    const codes = info.hourly.weather_code;
    const nowTemp = info.current.temperature_2m;

    const currentHour = info.current.time.slice(11,13);
    const isDay = isDayTime(currentHour);
    
    const start = currentHour;
    const from = start !== -1 ? start : 0;

    let bodyRows = "";
    for (let i = from; i < from + 24 && i < hours.length; i++) {
        const time = hours[i].slice(11, 16);
        const temp = temps[i];
        const icon = getWeatherIcon(codes[i], isDay);

        bodyRows += `<tr>
            <td>${time}</td>
            <td>${icon}</td>
            <td>${temp}°C</td>
        </tr>`;
    }

    document.querySelector("#forcast-24hours thead tr").innerHTML = "<th>Time</th><th>Condition</th><th>Temp</th>";
    document.getElementById("weather-table-body").innerHTML = bodyRows;
    document.getElementById("current-temp").innerHTML = `${nowTemp}°C`;
}


async function renderCurrentWeatherConditional() {
    const data = await fetchWeather(URL_CURRENT_WEATHER);

    const code = data.current.weather_code;

    const currentHour = getCurrentHour();
    const isDay = isDayTime(currentHour);
    const currentWeatherConditionIcon = getWeatherIcon(code, isDay, 80);

    document.getElementById("weather-icon").innerHTML = currentWeatherConditionIcon;
}

function getWeatherIcon(code, isDay = true, size = 32) {
    const WEATHER_ICONS = {
        0:  { icon: isDay ? 'sunny'                 : 'clear-night',                alt: 'Clear sky' },
        1:  { icon: isDay ? 'cloudy-clear-times'    : 'cloudy-clear-times-night',   alt: 'Mainly clear' },
        2:  { icon: isDay ? 'partly-cloudy'         : 'partly-cloudy-night',        alt: 'Partly cloudy' },
        3:  { icon: 'cloudy',                                                        alt: 'Overcast' },
        45: { icon: 'fog',                                                           alt: 'Fog' },
        48: { icon: 'fog',                                                           alt: 'Depositing rime fog' },
        51: { icon: isDay ? 'drizzle-sun'           : 'drizzle-night',              alt: 'Light drizzle' },
        53: { icon: 'drizzle',                                                       alt: 'Moderate drizzle' },
        55: { icon: 'drizzle',                                                       alt: 'Dense drizzle' },
        56: { icon: 'drizzle-night',                                                 alt: 'Light freezing drizzle' },
        57: { icon: 'drizzle-night',                                                 alt: 'Dense freezing drizzle' },
        61: { icon: isDay ? 'rain-sun'              : 'rain-night',                 alt: 'Slight rain' },
        63: { icon: isDay ? 'scatterad-showers'     : 'scatterad-showers-night',    alt: 'Moderate rain' },
        65: { icon: 'heavy-rain',                                                    alt: 'Heavy rain' },
        66: { icon: 'sleet',                                                         alt: 'Light freezing rain' },
        67: { icon: 'sleet',                                                         alt: 'Heavy freezing rain' },
        71: { icon: 'snow',                                                          alt: 'Slight snow fall' },
        73: { icon: 'snow',                                                          alt: 'Moderate snow fall' },
        75: { icon: 'blizzard',                                                      alt: 'Heavy snow fall' },
        77: { icon: 'hail',                                                          alt: 'Snow grains' },
        80: { icon: isDay ? 'scatterad-showers'     : 'scatterad-showers-night',    alt: 'Slight rain showers' },
        81: { icon: isDay ? 'rain-sun'              : 'rain-night',                 alt: 'Moderate rain showers' },
        82: { icon: 'heavy-rain',                                                    alt: 'Violent rain showers' },
        85: { icon: 'blowing-snow',                                                  alt: 'Slight snow showers' },
        86: { icon: 'blizzard',                                                      alt: 'Heavy snow showers' },
        95: { icon: 'scatterad-thunderstorm',                                        alt: 'Thunderstorm' },
        96: { icon: 'rain-thunderstorm',                                             alt: 'Thunderstorm with slight hail' },
        99: { icon: 'sever-thunder',                                                 alt: 'Thunderstorm with heavy hail' },
    };

    const { icon, alt } = WEATHER_ICONS[code] ?? { icon: 'cloudy', alt: 'Unknown' };
    return `<img src="assets/weather/${icon}.png" alt="${alt}" title="${alt}" width="${size}" height="${size}"/>`;
}

renderForcastWeather();

renderCurrentWeatherConditional();