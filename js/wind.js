const TIMESPANS = [
    { label: "Now",     pastDays: 1,  hours: 20  },
    { label: "24h",     pastDays: 1,  hours: 24  },
    { label: "48h",     pastDays: 2,  hours: 48  },
    { label: "72h",     pastDays: 3,  hours: 72  },
    { label: "1 Week",  pastDays: 7,  hours: 168 },
    { label: "1 Month", pastDays: 30, hours: 720 },
];

let activeTimespan = TIMESPANS[0];
let windChart = null;

function renderWindStats(dailyWind) {
    const stats = calculateStatistics(dailyWind);
    renderStatistics({
        mean: 'wind-mean', median: 'wind-median', mode: 'wind-mode',
        range: 'wind-range', std: 'wind-std', minmax: 'wind-minmax',
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
        return `<tr><td>${time}</td><td class="${cls}">${ms} m/s</td></tr>`;
    }).join('');
}

function renderWindChart(labels, windSpeed) {
    const canvas = document.getElementById('windChart');
    if (!canvas) return;
    if (windChart) windChart.destroy();
    windChart = new Chart(canvas, {
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

function renderTimespanButtons() {
    const container = document.getElementById('timespan-controls');
    if (!container) return;
    container.innerHTML = TIMESPANS.map(ts =>
        `<button class="timespan-btn ${ts.label === activeTimespan.label ? 'active' : ''}"
            data-label="${ts.label}">${ts.label}</button>`
    ).join('');
    container.querySelectorAll('.timespan-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            activeTimespan = TIMESPANS.find(ts => ts.label === btn.dataset.label);
            container.querySelectorAll('.timespan-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await update();
        });
    });
}

function getLastHours(hourlyTime, hourlyValues, count) {
    const currentIndex = hourlyTime.length - 1;
    const start = Math.max(0, currentIndex - count);
    return {
        labels: hourlyTime.slice(start, currentIndex).map(t => t.slice(11, 16)),
        values: hourlyValues.slice(start, currentIndex)
    };
}

async function update() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=61.4991&longitude=23.7871`
        + `&hourly=wind_speed_10m&daily=wind_speed_10m_max&wind_speed_unit=ms&timezone=auto`
        + `&past_days=${activeTimespan.pastDays}&forecast_days=0`;
    const data = await fetchWeather(url);
    if (!data) return;

    setElementText('stats-title', `Wind Analytics — ${activeTimespan.label}`);
    
    renderWindStats(data.daily.wind_speed_10m_max);
    const { labels, values: windSpeed } = getLastHours(data.hourly.time, data.hourly.wind_speed_10m, activeTimespan.hours);
    renderWindChart(labels, windSpeed);
    renderWindTable(labels, windSpeed);
}

document.addEventListener('DOMContentLoaded', async () => {
    renderTimespanButtons();
    await update();
});