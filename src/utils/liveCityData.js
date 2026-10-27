const DAVAO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=7.0731&longitude=125.6128&current=temperature_2m%2Capparent_temperature%2Crelative_humidity_2m%2Cweather_code%2Cwind_speed_10m&timezone=Asia%2FManila'
const USD_EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/USD'
const WEATHER_CACHE_MS = 15 * 60 * 1000
const EXCHANGE_RATE_CACHE_MS = 30 * 60 * 1000
const liveDataCache = new Map()

const weatherConditionKeys = new Map([
  [0, 'weather.condition.clear'],
  [1, 'weather.condition.mainlyClear'],
  [2, 'weather.condition.partlyCloudy'],
  [3, 'weather.condition.overcast'],
  [45, 'weather.condition.fog'],
  [48, 'weather.condition.fog'],
  [51, 'weather.condition.drizzle'],
  [53, 'weather.condition.drizzle'],
  [55, 'weather.condition.drizzle'],
  [56, 'weather.condition.drizzle'],
  [57, 'weather.condition.drizzle'],
  [61, 'weather.condition.rain'],
  [63, 'weather.condition.rain'],
  [65, 'weather.condition.rain'],
  [66, 'weather.condition.rain'],
  [67, 'weather.condition.rain'],
  [71, 'weather.condition.snow'],
  [73, 'weather.condition.snow'],
  [75, 'weather.condition.snow'],
  [77, 'weather.condition.snow'],
  [80, 'weather.condition.showers'],
  [81, 'weather.condition.showers'],
  [82, 'weather.condition.showers'],
  [85, 'weather.condition.snow'],
  [86, 'weather.condition.snow'],
  [95, 'weather.condition.thunderstorm'],
  [96, 'weather.condition.thunderstorm'],
  [99, 'weather.condition.thunderstorm'],
])

function assertResponse(response) {
  if (!response.ok) throw new Error(`External service returned HTTP ${response.status}.`)
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseLocalWeatherTime(value) {
  if (typeof value !== 'string') return null
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
    ? value
    : `${value}:00+08:00`
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getWeatherConditionKey(code) {
  return weatherConditionKeys.get(code) ?? 'weather.condition.unknown'
}

export async function fetchDavaoWeather(fetchImpl = fetch, signal) {
  const response = await fetchImpl(DAVAO_WEATHER_URL, {
    signal,
    headers: { Accept: 'application/json' },
  })
  assertResponse(response)
  const payload = await response.json()
  const current = payload?.current
  const observedAt = parseLocalWeatherTime(current?.time)
  if (
    !isFiniteNumber(current?.temperature_2m) ||
    !isFiniteNumber(current?.apparent_temperature) ||
    !isFiniteNumber(current?.relative_humidity_2m) ||
    !Number.isInteger(current?.weather_code) ||
    !isFiniteNumber(current?.wind_speed_10m) ||
    !observedAt
  ) {
    throw new Error('External service returned incomplete weather data.')
  }
  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    conditionKey: getWeatherConditionKey(current.weather_code),
    windSpeed: current.wind_speed_10m,
    observedAt,
  }
}

export async function getDavaoWeather(fetchImpl = fetch, signal, force = false) {
  return getCachedLiveData(
    'weather',
    WEATHER_CACHE_MS,
    force,
    () => fetchDavaoWeather(fetchImpl, signal),
  )
}

export async function fetchUsdPhpRate(fetchImpl = fetch, signal) {
  const response = await fetchImpl(USD_EXCHANGE_RATE_URL, {
    signal,
    headers: { Accept: 'application/json' },
  })
  assertResponse(response)
  const payload = await response.json()
  const updatedAt = typeof payload?.time_last_update_utc === 'string'
    ? new Date(payload.time_last_update_utc)
    : null
  if (
    payload?.result !== 'success' ||
    payload?.base_code !== 'USD' ||
    !isFiniteNumber(payload?.rates?.PHP) ||
    payload.rates.PHP <= 0 ||
    !updatedAt ||
    Number.isNaN(updatedAt.getTime())
  ) {
    throw new Error('External service returned an invalid exchange rate.')
  }
  return {
    usdToPhp: payload.rates.PHP,
    updatedAt,
  }
}

export async function getUsdPhpRate(fetchImpl = fetch, signal, force = false) {
  return getCachedLiveData(
    'usd-php',
    EXCHANGE_RATE_CACHE_MS,
    force,
    () => fetchUsdPhpRate(fetchImpl, signal),
  )
}

export function clearLiveCityDataCache() {
  liveDataCache.clear()
}

async function getCachedLiveData(key, ttl, force, load) {
  const cached = liveDataCache.get(key)
  if (!force && cached && cached.expiresAt > Date.now()) return structuredClone(cached.data)

  const data = await load()
  liveDataCache.set(key, { data, expiresAt: Date.now() + ttl })
  return structuredClone(data)
}
