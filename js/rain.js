const TIMESPANS = [
    { label: "Now",     pastDays: 1,  hours: 20  },
    { label: "24h",     pastDays: 1,  hours: 24  },
    { label: "48h",     pastDays: 2,  hours: 48  },
    { label: "72h",     pastDays: 3,  hours: 72  },
    { label: "1 Week",  pastDays: 7,  hours: 168 },
    { label: "1 Month", pastDays: 30, hours: 720 },
];

let activeTimespan = TIMESPANS[0];
let rainChart = null;

function renderRainStats(dailyRain) {
    const stats = calculateStatistics(dailyRain);
    renderStatistics({
        mean: 'rain-mean', median: 'rain-median', mode: 'rain-mode',
        range: 'rain-range', std: 'rain-std', minmax: 'rain-minmax',
        variance: 'rain-variance'
    }, stats, 'mm');
}

function renderRainTable(labels, rainAmount) {
    const tbody = document.getElementById('rain-table-body');
    if (!tbody) return;
    tbody.innerHTML = labels.map((time, i) => {
        const mm = rainAmount[i] ?? 0;
        let cls = 'rain-none', icon = '—';
        if (mm > 2)      { cls = 'rain-heavy'; icon = '🌧️'; }
        else if (mm > 0) { cls = 'rain-light'; icon = '🌦️'; }
        return `<tr><td>${time}</td><td class="${cls}">${icon} ${mm} mm</td></tr>`;
    }).join('');
}

function renderRainChart(labels, rainAmount) {
    const canvas = document.getElementById('rainChart');
    if (!canvas) return;
    if (rainChart) rainChart.destroy();
    rainChart = new Chart(canvas, {
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
            title: { display: true, text: `Rain — ${activeTimespan.label}` },
            scales: { yAxes: [{ ticks: { beginAtZero: true, min: 0 } }] }
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
        + `&hourly=rain&daily=rain_sum&timezone=auto`
        + `&past_days=${activeTimespan.pastDays}&forecast_days=0`;
    const data = await fetchWeather(url);
    if (!data) return;

    setElementText('stats-title', `Rain Analytics — ${activeTimespan.label}`);

    renderRainStats(data.daily.rain_sum);
    const { labels, values: rainAmount } = getLastHours(data.hourly.time, data.hourly.rain, activeTimespan.hours);
    renderRainChart(labels, rainAmount);
    renderRainTable(labels, rainAmount);
}

document.addEventListener('DOMContentLoaded', async () => {
    renderTimespanButtons();
    await update();
});