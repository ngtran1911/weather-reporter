console.log("this is common.js")

const BASE_URL = "https://api.open-meteo.com/v1";
const PAST = "past_days=7&forecast_days=0";

const URL_TEMP = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&${PAST}&hourly=temperature_2m,weather_code&current=temperature_2m&timezone=auto`;
const URL_CURRENT_WEATHER = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&current=weather_code&timezone=auto&${PAST}`;
const URL_7_DAYS_FORECAST = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&daily=temperature_2m_mean,weather_code&timezone=auto&${PAST}`;
const URL_AIR_CONDITIONS = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&current=apparent_temperature,wind_speed_10m,precipitation_probability,uv_index&timezone=auto&${PAST}`;
const URL_RAIN_STATUS = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&daily=rain_sum&timezone=auto&${PAST}`;
const URL_VISIBILITY = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&current=visibility&timezone=auto&${PAST}`;
const URL_WIND_STATISTIC = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&daily=wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&${PAST}`;
const URL_WIND_CHART = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&hourly=wind_speed_10m,wind_gusts_10m&wind_speed_unit=ms&timezone=auto&${PAST}`;
const URL_RAIN_CHART = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&hourly=rain&timezone=auto&past_days=1&forecast_days=0`;

async function fetchWeather(url) {
    console.log('Fetching ....')
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
function calculateStatistics(numbers) {
    if (numbers.length === 0) return {};
    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Mean 
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;

    // Median 
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 
        ? sorted[mid] 
        : (sorted[mid - 1] + sorted[mid]) / 2;

    // Mode
    const counts = {};
    numbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
    let maxCount = 0;
    let modes = [];
    for (let n in counts) {
        if (counts[n] > maxCount) {
            maxCount = counts[n];
            modes = [n];
        } else if (counts[n] === maxCount) {
            modes.push(n);
        }
    }

    const modeResult = modes.length === numbers.length ? "N/A" : modes.join(', ');

    
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    
    const range = max - min;

    return {
        mean: mean.toFixed(1),
        median: median.toFixed(1),
        mode: modeResult,
        range: range.toFixed(1),
        stdDev: stdDev.toFixed(1),
        minMax: `${min} / ${max}`,
        variance: variance.toFixed(1)
    };
}
