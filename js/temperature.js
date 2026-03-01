console.log("this is temperature.js");

const MEASUREMENTS = [
    { label: "Temperature",   variable: "temperature_2m",       unit: "°C"   },
    { label: "Rain",          variable: "rain",                  unit: "mm"   },
    { label: "Wind Speed",    variable: "wind_speed_10m",        unit: "m/s"  },
    { label: "Humidity",      variable: "relative_humidity_2m",  unit: "%"    },
    { label: "UV Index",      variable: "uv_index",              unit: ""     },
];

let tempChart = null;

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
    setElementText('real-feel',   current.apparent_temperature);
    setElementText('rain-chance', current.precipitation_probability);
    setElementText('wind-speed',  current.wind_speed_10m);
    setElementText('uv-index',    current.uv_index);
}

function renderTable(times, values, unit) {
    const thead = document.querySelector("#forcast-24hours thead tr");
    const tbody = document.getElementById("weather-table-body");
    if (thead) thead.innerHTML = `<th>Time</th><th>Value</th>`;
    if (tbody) tbody.innerHTML = times.map((t, i) =>
        `<tr><td>${t.slice(11, 16)}</td><td>${values[i] ?? '--'} ${unit}</td></tr>`
    ).join('');
}

function renderChart(times, values, label) {
    const canvas = document.getElementById('measurement-chart');
    if (!canvas) return;
    if (tempChart) tempChart.destroy();
    tempChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: times.map(t => t.slice(11, 16) || t.slice(0, 10)),
            datasets: [{
                label,
                data: values,
                borderColor: "#4D7CFE",
                backgroundColor: "rgba(77, 124, 254, 0.1)",
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false },
                x: { grid: { display: false } }
            }
        }
    });
}

async function updateInteractiveView() {
    const measurement = MEASUREMENTS.find(m => m.variable === document.getElementById('measurement-select').value);
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate || !measurement) return;

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=61.4991&longitude=23.7871`
        + `&hourly=${measurement.variable}&timezone=auto`
        + `&start_date=${startDate}&end_date=${endDate}`;

    const data = await fetchWeather(url);
    if (!data) return;

    const times = data.hourly.time;
    const values = data.hourly[measurement.variable];

    renderTable(times, values, measurement.unit);
    renderChart(times, values, `${measurement.label} (${measurement.unit})`);
}

function initControls() {
    const select = document.getElementById('measurement-select');
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');

    if (select) {
        select.innerHTML = MEASUREMENTS.map(m =>
            `<option value="${m.variable}">${m.label}</option>`
        ).join('');
        select.addEventListener('change', updateInteractiveView);
    }

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (startDate) { startDate.value = weekAgo; startDate.max = today; startDate.addEventListener('change', updateInteractiveView); }
    if (endDate)   { endDate.value = today;    endDate.max = today;   endDate.addEventListener('change', updateInteractiveView); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_TEMPERATURE_PAGE);
    if (!data) return;

    const currentHour = parseInt(data.current.time.slice(11, 13));
    const isDay = isDayTime(currentHour);

    renderCurrentConditions(data.current, isDay);
    renderForecast(data.daily);
    renderAirConditions(data.current);

    initControls();
    await updateInteractiveView();
});