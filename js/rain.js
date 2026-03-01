console.log("hello rain.js");

function renderRainStats(dailyRain) {
    const stats = calculateStatistics(dailyRain);
    renderStatistics({
        mean:     'rain-mean',
        median:   'rain-median',
        mode:     'rain-mode',
        range:    'rain-range',
        std:      'rain-std',
        minmax:   'rain-minmax',
        variance: 'rain-variance'
    }, stats, 'mm');
}

function renderRainTable(labels, rainAmount) {
    const tbody = document.getElementById('rain-table-body');
    if (!tbody) return;

    tbody.innerHTML = labels.map((time, i) => {
        const mm = rainAmount[i] ?? 0;
        let cls = 'rain-none';
        let icon = '—';
        if (mm > 2)      { cls = 'rain-heavy'; icon = '🌧️'; }
        else if (mm > 0) { cls = 'rain-light'; icon = '🌦️'; }

        return `<tr>
            <td>${time}</td>
            <td class="${cls}">${icon} ${mm} mm</td>
        </tr>`;
    }).join('');
}

function renderRainChart(labels, rainAmount) {
    const canvas = document.getElementById('rainChart');
    if (!canvas) return;

    new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Rain (mm)",
                data: rainAmount,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            title: { display: true, text: "Hourly Rain (last 20 hours)" },
            scales: {
                yAxes: [{ ticks: { beginAtZero: true, min: 0 } }]
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
    const [pageData, chartData] = await Promise.all([
        fetchWeather(URL_RAIN_PAGE),
        fetchWeather(URL_RAIN_CHART)
    ]);

    if (!pageData || !chartData) return;

    renderRainStats(pageData.daily.rain_sum);

    const { labels, values: rainAmount } = getLastHours(chartData.hourly.time, chartData.hourly.rain);
    renderRainChart(labels, rainAmount);
    renderRainTable(labels, rainAmount);
});