import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearLiveCityDataCache,
  fetchDavaoWeather,
  fetchUsdPhpRate,
  getDavaoWeather,
  getUsdPhpRate,
  getWeatherConditionKey,
} from '../utils/liveCityData.js'

function response(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => payload,
  }
}

test('Davao weather fetch validates fields and interprets the local observation time', async () => {
  let requestUrl = ''
  const data = await fetchDavaoWeather(async (url) => {
    requestUrl = url
    return response({
      current: {
        temperature_2m: 30.1,
        apparent_temperature: 35,
        relative_humidity_2m: 70,
        weather_code: 2,
        wind_speed_10m: 8.5,
        time: '2026-10-27T15:30',
      },
    })
  })

  assert.equal(new URL(requestUrl).searchParams.get('timezone'), 'Asia/Manila')
  assert.equal(data.temperature, 30.1)
  assert.equal(data.conditionKey, 'weather.condition.partlyCloudy')
  assert.equal(data.observedAt.toISOString(), '2026-10-27T07:30:00.000Z')
})

test('weather rejects failed responses and malformed values', async () => {
  await assert.rejects(
    fetchDavaoWeather(async () => response({}, false, 503)),
    /HTTP 503/,
  )
  await assert.rejects(
    fetchDavaoWeather(async () => response({ current: { temperature_2m: 'warm' } })),
    /incomplete weather data/,
  )
})

test('USD to PHP fetch accepts only a successful positive rate with a date', async () => {
  const data = await fetchUsdPhpRate(async () => response({
    result: 'success',
    base_code: 'USD',
    rates: { PHP: 63.96 },
    time_last_update_utc: 'Tue, 27 Oct 2026 00:02:31 +0000',
  }))

  assert.equal(data.usdToPhp, 63.96)
  assert.equal(data.updatedAt.toISOString(), '2026-10-27T00:02:31.000Z')
})

test('USD to PHP rejects failed, malformed, or nonpositive rates', async () => {
  await assert.rejects(
    fetchUsdPhpRate(async () => response({}, false, 429)),
    /HTTP 429/,
  )
  await assert.rejects(
    fetchUsdPhpRate(async () => response({
      result: 'error',
      base_code: 'USD',
      rates: { PHP: 0 },
      time_last_update_utc: 'invalid',
    })),
    /invalid exchange rate/,
  )
})

test('unknown weather codes map to a localized unavailable state', () => {
  assert.equal(getWeatherConditionKey(999), 'weather.condition.unknown')
})

test('live weather and exchange data are cached and can be explicitly refreshed', async () => {
  clearLiveCityDataCache()
  let weatherRequests = 0
  let rateRequests = 0
  const weatherFetch = async () => {
    weatherRequests += 1
    return response({
      current: {
        temperature_2m: 29,
        apparent_temperature: 33,
        relative_humidity_2m: 75,
        weather_code: 3,
        wind_speed_10m: 6,
        time: '2026-10-27T15:30',
      },
    })
  }
  const rateFetch = async () => {
    rateRequests += 1
    return response({
      result: 'success',
      base_code: 'USD',
      rates: { PHP: 64 },
      time_last_update_utc: 'Tue, 27 Oct 2026 00:02:31 +0000',
    })
  }

  await getDavaoWeather(weatherFetch)
  await getDavaoWeather(weatherFetch)
  await getDavaoWeather(weatherFetch, undefined, true)
  await getUsdPhpRate(rateFetch)
  await getUsdPhpRate(rateFetch)
  await getUsdPhpRate(rateFetch, undefined, true)

  assert.equal(weatherRequests, 2)
  assert.equal(rateRequests, 2)
  clearLiveCityDataCache()
})
