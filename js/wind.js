document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_WIND);

    const stats = calculateStatistics(data.daily.wind_speed_10m_max);
    document.getElementById('wind-mean').innerText = `${stats.mean} m/s`;
    document.getElementById('wind-median').innerText = `${stats.median} m/s`;
    document.getElementById('wind-mode').innerText = stats.mode === "N/A" ? "N/A" : `${stats.mode} m/s`;
    document.getElementById('wind-range').innerText = `${stats.range} m/s`;
    document.getElementById('wind-std').innerText = stats.stdDev;
    document.getElementById('wind-minmax').innerText = stats.minMax;
    document.getElementById('wind-variance').innerText = stats.variance;

    const allHours = data.hourly.time;
    const allWind = data.hourly.wind_speed_10m;
    const currentIndex = allHours.length - 1;
    const start = Math.max(0, currentIndex - 19);

    const labels = allHours.slice(start, currentIndex).map(t => t.slice(11, 16));
    const windSpeed = allWind.slice(start, currentIndex);

    document.getElementById('wind-table-body').innerHTML = labels.map((time, i) => {
        const ms = windSpeed[i]?.toFixed(1) ?? '--';
        let cls = 'wind-calm';
        if (windSpeed[i] > 10)     cls = 'wind-strong';
        else if (windSpeed[i] > 3) cls = 'wind-light';
        return `<tr><td>${time}</td><td class="${cls}">${ms} m/s</td></tr>`;
    }).join('');

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
});