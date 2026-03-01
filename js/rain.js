console.log("hello rain.js");

document.addEventListener('DOMContentLoaded', async () => {
    const [pageData, chartData] = await Promise.all([
        fetchWeather(URL_RAIN_PAGE),
        fetchWeather(URL_RAIN_CHART)
    ]);

    const stats = calculateStatistics(pageData.daily.rain_sum);
    document.getElementById('rain-mean').innerText = `${stats.mean} mm`;
    document.getElementById('rain-median').innerText = `${stats.median} mm`;
    document.getElementById('rain-mode').innerText = stats.mode === "N/A" ? "0 mm" : `${stats.mode} mm`;
    document.getElementById('rain-range').innerText = `${stats.range} mm`;
    document.getElementById('rain-std').innerText = stats.stdDev;
    document.getElementById('rain-minmax').innerText = `${stats.minMax} mm`;
    document.getElementById('rain-variance').innerText = stats.variance;

    const allHours = chartData.hourly.time;
    const allRain = chartData.hourly.rain;
    const currentIndex = allHours.length - 1;
    const start = Math.max(0, currentIndex - 19);

    const labels = allHours.slice(start, currentIndex).map(t => t.slice(11, 16));
    const rainAmount = allRain.slice(start, currentIndex);

    new Chart(document.getElementById('rainChart'), {
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
                yAxes: [{
                    ticks: { beginAtZero: true, min: 0 }
                }]
            }
        }
    });

    document.getElementById('rain-table-body').innerHTML = labels.map((time, i) => {
        const mm = rainAmount[i] ?? 0;
        let rainClass = 'rain-none';
        let icon = '—';
        if (mm > 2)      { rainClass = 'rain-heavy'; icon = '🌧️'; }
        else if (mm > 0) { rainClass = 'rain-light'; icon = '🌦️'; }

        return `<tr>
            <td>${time}</td>
            <td class="${rainClass}">${icon} ${mm} mm</td>
        </tr>`;
    }).join('');
});