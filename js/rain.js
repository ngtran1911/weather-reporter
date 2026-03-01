async function getRainStatistics() {
    const data = await fetchWeather(URL_RAIN_STATUS);
    const stats = calculateStatistics(data.daily.rain_sum);

    document.getElementById('rain-mean').innerText = `${stats.mean} mm`;
    document.getElementById('rain-median').innerText = `${stats.median} mm`;
    document.getElementById('rain-mode').innerText = stats.mode === "N/A" ? "0 mm" : `${stats.mode} mm`;
    document.getElementById('rain-range').innerText = `${stats.range} mm`;
    document.getElementById('rain-std').innerText = stats.stdDev;
    document.getElementById('rain-minmax').innerText = `${stats.minMax} mm`;
    document.getElementById('rain-variance').innerText = stats.variance;
}

async function clothingSuggestion() {
    const info = await fetchWeather(URL_TEMP);
    const temp = info.current.temperature_2m;

    let advice;
    if (temp < 0) advice = "Freezing temperatures! Remember to wear a thick down jacket, a scarf, and gloves. 🧣🧤";
    else if (temp < 10) advice = "It's quite cold. A warm coat and a sweater are good choices. 🧥";
    else if (temp < 20) advice = "Cool weather. You just need a hoodie or a light jacket. 👕";
    else advice = "It's getting warm! Wear a T-shirt for comfort. ☀️";

    document.getElementById('clothing-advice').innerText = advice;
}

async function updateVisibilityUI() {
    const data = await fetchWeather(URL_VISIBILITY);
    if (!data?.current) return;

    const km = data.current.visibility / 1000;

    document.getElementById('visibility-value').innerText = `${km.toFixed(1)} km`;

    let statusText, statusColor;
    if (km >= 10) { statusText = "Clear View"; statusColor = "#00ff88"; }
    else if (km >= 5) { statusText = "Hazy"; statusColor = "#ffcc00"; }
    else { statusText = "Foggy / Heavy Snow"; statusColor = "#ff4d4d"; }

    const statusElem = document.getElementById('visibility-status');
    if (statusElem) {
        statusElem.innerText = statusText;
        statusElem.style.setProperty('color', statusColor, 'important');
    }
}

async function renderRainChart() {
    const data = await fetchWeather(URL_RAIN_CHART);

    const allHours = data.hourly.time;
    const allRain = data.hourly.rain;

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
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Hourly Rain (last 20 hours)" }
            }
        }
    });

    const tbody = document.getElementById('rain-table-body');
    tbody.innerHTML = labels.map((time, i) => `
        <tr>
            <td>${time}</td>
            <td>${rainAmount[i] ?? 0} mm</td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    getRainStatistics();
    clothingSuggestion();
    updateVisibilityUI();
    renderRainChart();
});