console.log("hello wind.js");

async function fetchWindAnalytics() {
    const data = await fetchWeather(URL_WIND_STATISTIC);
    const windSpeeds = data.daily.wind_speed_10m_max;
    const stats = calculateStatistics(windSpeeds);

    document.getElementById('wind-mean').innerText = `${stats.mean} m/s`;
    document.getElementById('wind-median').innerText = `${stats.median} m/s`;
    document.getElementById('wind-mode').innerText = stats.mode === "N/A" ? "N/A" : `${stats.mode} m/s`;
    document.getElementById('wind-range').innerText = `${stats.range} m/s`;
    document.getElementById('wind-std').innerText = stats.stdDev;
    document.getElementById('wind-minmax').innerText = stats.minMax;
    document.getElementById('wind-variance').innerText = stats.variance;
}

function updateWindWidgets(currentTemp, windSpeedMs, windGustMs) {
    const windKmH = windSpeedMs * 3.6;
    const gustKmH = windGustMs * 3.6;

    // Wind chill
    let windChill = currentTemp;
    if (currentTemp <= 10 && windKmH > 4.8) {
        windChill = 13.12 + 0.6215 * currentTemp
            - 11.37 * Math.pow(windKmH, 0.16)
            + 0.3965 * currentTemp * Math.pow(windKmH, 0.16);
    }
    document.getElementById('wind-chill').innerText = `${Math.round(windChill)}°C`;

    // Beaufort & status
    let beaufort, status;
    if (windKmH < 1)        { beaufort = "F0"; status = "Calm"; }
    else if (windKmH < 11)  { beaufort = "F1-2"; status = "Light"; }
    else if (windKmH < 28)  { beaufort = "F3-4"; status = "Moderate"; }
    else                    { beaufort = "F5+"; status = "Strong"; }

    document.getElementById('beaufort-scale').innerText = beaufort;
    document.getElementById('wind-status').innerText = status;

    // Turbine
    let turbine;
    if (windSpeedMs >= 3 && windSpeedMs <= 20) turbine = "Optimal";
    else if (windSpeedMs > 25)                 turbine = "Emergency Stop";
    else                                        turbine = "Low";
    document.getElementById('turbine-hint').innerText = turbine;

    // Gust
    document.getElementById('wind-gust').innerText = `${gustKmH.toFixed(1)} km/h`;

    // Activity
    let activity;
    if (windKmH > 30)       activity = "Indoor Only";
    else if (windKmH > 15)  activity = "Walking";
    else                    activity = "Cycling";
    document.getElementById('activity-hint').innerText = activity;
}

async function renderWindChart() {
    const data = await fetchWeather(URL_WIND_CHART);

    const allHours = data.hourly.time;
    const allWind = data.hourly.wind_speed_10m;
    const allGusts = data.hourly.wind_gusts_10m;

    const currentIndex = allHours.length - 1;
    const start = Math.max(0, currentIndex - 19);

    const labels = allHours.slice(start, currentIndex).map(t => t.slice(11, 16));
    const windSpeed = allWind.slice(start, currentIndex);

    // Pass real current values to widgets
    const tempData = await fetchWeather(URL_TEMP);
    updateWindWidgets(
        tempData.current.temperature_2m,
        allWind[currentIndex],
        allGusts[currentIndex]
    );

    new Chart(document.getElementById('windChart'), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: 'Wind Speed (m/s)',
                borderColor: "#4D7CFE",
                backgroundColor: "rgba(77, 124, 254, 0.1)",
                data: windSpeed,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWindAnalytics();
    renderWindChart();
})