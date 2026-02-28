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


// Gọi hàm ngay khi trang web tải xong
document.addEventListener('DOMContentLoaded', fetchWindAnalytics);