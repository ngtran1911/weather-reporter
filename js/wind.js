console.log("hello wind.js")


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

        console.log("Analytics updated for Tampere:", stats);
}

function updateWindWidgets(currentTemp, windSpeedMs, windGustMs) {
    const windKmH = windSpeedMs * 3.6;
    const gustKmH = windGustMs * 3.6;

    
    let windChill = currentTemp;
    if (currentTemp <= 10 && windKmH > 4.8) {
        windChill = 13.12 + 0.6215 * currentTemp - 11.37 * Math.pow(windKmH, 0.16) + 0.3965 * currentTemp * Math.pow(windKmH, 0.16);
    }
    document.getElementById('wind-chill').innerText = `${Math.round(windChill)}°C`;

    let beaufort = "F0";
    let status = "Calm";
    if (windKmH < 1) { beaufort = "F0"; status = "Calm"; }
    else if (windKmH < 11) { beaufort = "F1-2"; status = "Light"; }
    else if (windKmH < 28) { beaufort = "F3-4"; status = "Moderate"; }
    else { beaufort = "F5+"; status = "Strong"; }
    
    document.getElementById('beaufort-scale').innerText = beaufort;
    document.getElementById('wind-status').innerText = status;

    let turbine = "Low";
    if (windSpeedMs >= 3 && windSpeedMs <= 20) turbine = "Optimal";
    else if (windSpeedMs > 25) turbine = "Emergency Stop";
    document.getElementById('turbine-hint').innerText = turbine;

    document.getElementById('wind-gust').innerText = `${gustKmH.toFixed(1)} km/h`;

    let activity = "Cycling";
    if (windKmH > 30) activity = "Indoor Only";
    else if (windKmH > 15) activity = "Walking";
    document.getElementById('activity-hint').innerText = activity;
} 
async function renderWindChart() {
    const data = await fetchWeather(URL_WIND_CHART);
    const hours = data.hourly.time.map(time => time.slice(11,13));
    const windSpeed = data.hourly.wind_speed_10m;
    const xValue = hours;
    const yValue = windSpeed;
    const myChart = document.getElementById('windChart')

    new Chart(myChart,{
        type : "line",
        data: {
            labels : xValue,
            datasets:[{
                label:'Wind Speed (m/s)',
                backgroundColor:"white",
                borderColor: "#38506A",
                data: yValue,
                tension: 0.5
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
    })
}
document.addEventListener('DOMContentLoaded', () => {
    fetchWindAnalytics();
    updateWindWidgets(); 
    renderWindChart();
});