console.log("this is temperature.js");

const PEXELS_API_KEY = 'd4mHPfw4NKEJ9xwmZlQvYPCCKnWmO2I59uIusryjhO1Nr2bzA8iuyhp4';

const MEASUREMENTS = [
    { label: "Temperature", variable: "temperature_2m",        unit: "°C"  },
    { label: "Rain",        variable: "rain",                  unit: "mm"  },
    { label: "Wind Speed",  variable: "wind_speed_10m",        unit: "m/s" },
    { label: "Humidity",    variable: "relative_humidity_2m",  unit: "%"   },
    { label: "UV Index",    variable: "uv_index",              unit: ""    },
];

const WEATHER_ICONS = {
    0:  { icon: (d) => d ? 'sunny' : 'clear-night',                            alt: 'clear sky'           },
    1:  { icon: (d) => d ? 'cloudy-clear-times' : 'cloudy-clear-times-night',  alt: 'mainly clear sky'    },
    2:  { icon: (d) => d ? 'partly-cloudy' : 'partly-cloudy-night',            alt: 'partly cloudy sky'   },
    3:  { icon: () => 'cloudy',                                                 alt: 'overcast sky'        },
    45: { icon: () => 'fog',                                                    alt: 'foggy morning'       },
    48: { icon: () => 'fog',                                                    alt: 'dense fog'           },
    51: { icon: (d) => d ? 'drizzle-sun' : 'drizzle-night',                    alt: 'light drizzle'       },
    53: { icon: () => 'drizzle',                                                alt: 'drizzle'             },
    55: { icon: () => 'drizzle',                                                alt: 'heavy drizzle'       },
    56: { icon: () => 'drizzle-night',                                          alt: 'freezing drizzle'    },
    57: { icon: () => 'drizzle-night',                                          alt: 'dense freezing drizzle' },
    61: { icon: (d) => d ? 'rain-sun' : 'rain-night',                          alt: 'light rain'          },
    63: { icon: (d) => d ? 'scatterad-showers' : 'scatterad-showers-night',    alt: 'moderate rain'       },
    65: { icon: () => 'heavy-rain',                                             alt: 'heavy rain'          },
    66: { icon: () => 'sleet',                                                  alt: 'freezing rain'       },
    67: { icon: () => 'sleet',                                                  alt: 'heavy freezing rain' },
    71: { icon: () => 'snow',                                                   alt: 'light snow'          },
    73: { icon: () => 'snow',                                                   alt: 'snowfall'            },
    75: { icon: () => 'blizzard',                                               alt: 'heavy snow'          },
    77: { icon: () => 'hail',                                                   alt: 'snow grains'         },
    80: { icon: (d) => d ? 'scatterad-showers' : 'scatterad-showers-night',    alt: 'rain shower'         },
    81: { icon: (d) => d ? 'rain-sun' : 'rain-night',                          alt: 'rain showers'        },
    82: { icon: () => 'heavy-rain',                                             alt: 'violent rain'        },
    85: { icon: () => 'blowing-snow',                                           alt: 'snow shower'         },
    86: { icon: () => 'blizzard',                                               alt: 'heavy snow shower'   },
    95: { icon: () => 'scatterad-thunderstorm',                                 alt: 'thunderstorm'        },
    96: { icon: () => 'rain-thunderstorm',                                      alt: 'thunderstorm hail'   },
    99: { icon: () => 'sever-thunder',                                          alt: 'severe thunderstorm' },
};

let tempChart = null;

function isDayTime(hour) {
    return hour >= 6 && hour < 17;
}

function getWeatherIcon(code, isDay = true, size = 32) {
    const entry = WEATHER_ICONS[code] ?? { icon: () => 'cloudy', alt: 'Unknown' };
    const icon = entry.icon(isDay);
    const alt = entry.alt;
    return `<img src="assets/weather/${icon}.png" alt="${alt}" title="${alt}" width="${size}" height="${size}"/>`;
}

async function fetchWeatherBackground(keyword) {
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
            { headers: { Authorization: PEXELS_API_KEY } }
        );
        const data = await response.json();
        if (!data.photos?.length) return null;
        const random = data.photos[Math.floor(Math.random() * data.photos.length)];
        return random.src.large;
    } catch {
        return null;
    }
}

async function applyWeatherBackground(code, isDay) {
    const alt = (WEATHER_ICONS[code] ?? { alt: 'sky weather' }).alt;
    const keyword = isDay ? alt : `${alt} night dark`;
    const imageUrl = await fetchWeatherBackground(keyword);
    const hero = document.getElementById('weather-hero');
    if (!hero || !imageUrl) return;
    hero.style.backgroundImage = `url('${imageUrl}')`;
}

async function renderCurrentConditions(current, isDay) {
    setElementText('current-temp', `${current.temperature_2m}°C`);
    const iconEl = document.getElementById('weather-icon');
    if (iconEl) iconEl.innerHTML = getWeatherIcon(current.weather_code, isDay, 80);
    await applyWeatherBackground(current.weather_code, isDay);
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
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 8, maxRotation: 45, minRotation: 0 }
                },
                y: { beginAtZero: false }
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

    renderTable(data.hourly.time, data.hourly[measurement.variable], measurement.unit);
    renderChart(data.hourly.time, data.hourly[measurement.variable], `${measurement.label} (${measurement.unit})`);
}

function initControls() {
    const select = document.getElementById('measurement-select');
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (select) {
        select.innerHTML = MEASUREMENTS.map(m =>
            `<option value="${m.variable}">${m.label}</option>`
        ).join('');
        select.addEventListener('change', updateInteractiveView);
    }

    if (startDate) { startDate.value = weekAgo; startDate.max = today; startDate.addEventListener('change', updateInteractiveView); }
    if (endDate)   { endDate.value = today;     endDate.max = today;   endDate.addEventListener('change', updateInteractiveView); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_TEMPERATURE_PAGE);
    if (!data) return;

    const currentHour = parseInt(data.current.time.slice(11, 13));
    const isDay = isDayTime(currentHour);

    await renderCurrentConditions(data.current, isDay);
    renderForecast(data.daily);
    renderAirConditions(data.current);
    initControls();
    await updateInteractiveView();
});