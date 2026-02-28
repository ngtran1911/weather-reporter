async function getRainStatistics() {
    const data = await fetchWeather(URL_RAIN_STATUS);

    const rainAmounts = data.daily.rain_sum;
    const stats = calculateStatistics(rainAmounts);

    document.getElementById('rain-mean').innerText = `${stats.mean} mm`;
        document.getElementById('rain-median').innerText = `${stats.median} mm`;
        document.getElementById('rain-mode').innerText = stats.mode === "N/A" ? "0 mm" : `${stats.mode} mm`;
        document.getElementById('rain-range').innerText = `${stats.range} mm`;
        document.getElementById('rain-std').innerText = stats.stdDev;
        document.getElementById('rain-minmax').innerText = `${stats.minMax} mm`;
        document.getElementById('rain-variance').innerText = stats.variance;
    }
async function clothingSuggestion(){
    const info = await fetchWeather(URL_TEMP);
    const temp = info.current.temperature_2m;
    let advice ="";

    if (temp < 0) {
        advice = "Freezing temperatures! Remember to wear a thick down jacket, a scarf, and gloves. 🧣🧤";
    } else if (temp >= 0 && temp < 10) {
        advice = "It's quite cold. A warm coat and a sweater are good choices. 🧥";
    } else if (temp >= 10 && temp < 20) {
        advice = "Cool weather. You just need a hoodie or a light jacket. 👕";
    } else {
        advice = "It's getting warm! Wear a T-shirt for comfort. ☀️";
    }

    document.getElementById('clothing-advice').innerText = advice;
}
async function updateVisibilityUI() {
    console.log("Checking visibility...");
    const data = await fetchWeather(URL_VISIBILITY);
    
    if (!data || !data.current) return;

    const visibilityMeters = data.current.visibility;
    const km = visibilityMeters / 1000;

    const valueElem = document.getElementById('visibility-value');
    if (valueElem) {
        valueElem.innerText = `${km.toFixed(1)} km`;
    }

    let statusText = "";
    let statusColor = "";

   
    if (km >= 10) {
        statusText = "Clear View";
        statusColor = "#00ff88"; 
    } else if (km >= 5) {
        statusText = "Hazy";
        statusColor = "#ffcc00"; 
    } else {
        statusText = "Foggy / Heavy Snow";
        statusColor = "#ff4d4d"; 
    }

    const statusElem = document.getElementById('visibility-status');
    if (statusElem) {
        statusElem.innerText = statusText;
        statusElem.style.color = statusColor;
        console.log("Color changed to:", statusColor); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getRainStatistics();
    clothingSuggestion(); 
    updateVisibilityUI();
});