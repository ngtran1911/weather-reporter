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

async function renderWindChart() {
    const data = await fetchWeather(URL_WIND_CHART);

    const allHours = data.hourly.time;
    const allWind = data.hourly.wind_speed_10m;

    const currentIndex = allHours.length - 1;
    const start = Math.max(0, currentIndex - 19);

    const labels = allHours.slice(start, currentIndex).map(t => t.slice(11, 16));
    const windSpeed = allWind.slice(start, currentIndex);

    // Populate table
    const tbody = document.getElementById('wind-table-body');
    tbody.innerHTML = labels.map((time, i) => {
        const ms = windSpeed[i]?.toFixed(1) ?? '--';
        const kmh = windSpeed[i] ? (windSpeed[i] * 3.6).toFixed(1) : '--';
        let cls = 'wind-calm';
        if (windSpeed[i] > 10)     cls = 'wind-strong';
        else if (windSpeed[i] > 3) cls = 'wind-light';

        return `<tr>
            <td>${time}</td>
            <td class="${cls}">${ms} m/s</td>
        </tr>`;
    }).join('');

    // Render chart
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
});