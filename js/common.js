console.log("this is common.js");

const BASE_URL = "https://api.open-meteo.com/v1";
const PAST = "past_days=7&forecast_days=0";

const URL_TEMPERATURE_PAGE = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871`
    + `&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m,precipitation_probability,uv_index`
    + `&hourly=temperature_2m,weather_code`
    + `&daily=temperature_2m_mean,weather_code`
    + `&timezone=auto&${PAST}`;

const URL_RAIN_PAGE  = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&daily=rain_sum&timezone=auto&${PAST}`;
const URL_RAIN_CHART = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871&hourly=rain&timezone=auto&past_days=1&forecast_days=0`;

const URL_WIND = `${BASE_URL}/forecast?latitude=61.4991&longitude=23.7871`
    + `&daily=wind_speed_10m_max,wind_gusts_10m_max`
    + `&hourly=wind_speed_10m,wind_gusts_10m`
    + `&wind_speed_unit=ms&timezone=auto&${PAST}`;

async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch: ${url}`, error);
        return null;
    }
}

function calculateStatistics(numbers) {
    if (!numbers || numbers.length === 0) return {};

    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;

    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    const counts = {};
    numbers.forEach(n => counts[n] = (counts[n] || 0) + 1);
    let maxCount = 0;
    let modes = [];
    for (let n in counts) {
        if (counts[n] > maxCount)       { maxCount = counts[n]; modes = [n]; }
        else if (counts[n] === maxCount) { modes.push(n); }
    }
    const mode = modes.length === numbers.length ? "N/A" : modes.join(', ');

    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    const range = max - min;

    return {
        mean:   mean.toFixed(1),
        median: median.toFixed(1),
        mode,
        range:  range.toFixed(1),
        stdDev: stdDev.toFixed(1),
        minMax: `${min} / ${max}`,
        variance: variance.toFixed(1)
    };
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function renderStatistics(ids, stats, unit = '') {
    setElementText(ids.mean,     `${stats.mean} ${unit}`);
    setElementText(ids.median,   `${stats.median} ${unit}`);
    setElementText(ids.mode,     stats.mode === "N/A" ? `N/A` : `${stats.mode} ${unit}`);
    setElementText(ids.range,    `${stats.range} ${unit}`);
    setElementText(ids.std,      stats.stdDev);
    setElementText(ids.minmax,   `${stats.minMax} ${unit}`);
    setElementText(ids.variance, stats.variance);
}