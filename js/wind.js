console.log("hello wind.js");

function renderWindStats(dailyWind) {
    const stats = calculateStatistics(dailyWind);
    renderStatistics({
        mean:     'wind-mean',
        median:   'wind-median',
        mode:     'wind-mode',
        range:    'wind-range',
        std:      'wind-std',
        minmax:   'wind-minmax',
        variance: 'wind-variance'
    }, stats, 'm/s');
}

function renderWindTable(labels, windSpeed) {
    const tbody = document.getElementById('wind-table-body');
    if (!tbody) return;

    tbody.innerHTML = labels.map((time, i) => {
        const ms = windSpeed[i]?.toFixed(1) ?? '--';
        let cls = 'wind-calm';
        if (windSpeed[i] > 10)     cls = 'wind-strong';
        else if (windSpeed[i] > 3) cls = 'wind-light';

        return `<tr>
            <td>${time}</td>
            <td class="${cls}">${ms} m/s</td>
        </tr>`;
    }).join('');
}

function renderWindChart(labels, windSpeed) {
    const canvas = document.getElementById('windChart');
    if (!canvas) return;

    new Chart(canvas, {
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

function getLastHours(hourlyTime, hourlyValues, count = 20) {
    const currentIndex = hourlyTime.length - 1;
    const start = Math.max(0, currentIndex - count);
    const labels = hourlyTime.slice(start, currentIndex).map(t => t.slice(11, 16));
    const values = hourlyValues.slice(start, currentIndex);
    return { labels, values };
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather(URL_WIND);
    if (!data) return;

    renderWindStats(data.daily.wind_speed_10m_max);

    const { labels, values: windSpeed } = getLastHours(data.hourly.time, data.hourly.wind_speed_10m);
    renderWindChart(labels, windSpeed);
    renderWindTable(labels, windSpeed);
});