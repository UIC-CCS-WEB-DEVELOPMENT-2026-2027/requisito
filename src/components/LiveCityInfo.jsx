import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getDavaoWeather, getUsdPhpRate } from '../utils/liveCityData.js'
import DavaoWeatherMap from './DavaoWeatherMap.jsx'

const localeByLanguage = { en: 'en-PH', fil: 'fil-PH', ceb: 'ceb-PH' }
const WEATHER_REFRESH_MS = 15 * 60 * 1000
const RATE_REFRESH_MS = 30 * 60 * 1000

function LiveCityInfo() {
  const { language, t } = useLanguage()
  const [weather, setWeather] = useState({ status: 'loading', data: null })
  const [exchangeRate, setExchangeRate] = useState({ status: 'loading', data: null })
  const [clock, setClock] = useState(() => new Date())
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0)
  const [rateRefreshKey, setRateRefreshKey] = useState(0)
  const locale = localeByLanguage[language] ?? 'en-PH'

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getDavaoWeather(fetch, controller.signal, weatherRefreshKey > 0)
      .then((data) => {
        if (active) setWeather({ status: 'ready', data })
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setWeather({ status: 'error', data: null })
      })

    const timer = window.setInterval(
      () => setWeatherRefreshKey((key) => key + 1),
      WEATHER_REFRESH_MS,
    )
    return () => {
      active = false
      controller.abort()
      window.clearInterval(timer)
    }
  }, [weatherRefreshKey])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getUsdPhpRate(fetch, controller.signal, rateRefreshKey > 0)
      .then((data) => {
        if (active) setExchangeRate({ status: 'ready', data })
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setExchangeRate({ status: 'error', data: null })
      })

    const timer = window.setInterval(
      () => setRateRefreshKey((key) => key + 1),
      RATE_REFRESH_MS,
    )
    return () => {
      active = false
      controller.abort()
      window.clearInterval(timer)
    }
  }, [rateRefreshKey])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const formatTime = (date, timeZone = 'Asia/Manila') => new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(date)

  const formatMoney = (amount) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(amount)

  function refresh() {
    setWeather({ status: 'loading', data: null })
    setExchangeRate({ status: 'loading', data: null })
    setWeatherRefreshKey((key) => key + 1)
    setRateRefreshKey((key) => key + 1)
  }

  return (
    <section className="live-city-section" aria-labelledby="live-city-title">
      <div className="live-city-heading">
        <div>
          <p className="eyebrow">{t('live.eyebrow')}</p>
          <h2 id="live-city-title">{t('live.title')}</h2>
        </div>
        <button className="secondary-button" type="button" onClick={refresh}>
          {t('live.refresh')}
        </button>
      </div>
      <div className="live-city-grid">
        <article className="live-data-card">
          <h3>{t('live.weatherTitle')}</h3>
          {weather.status === 'loading' && <p role="status">{t('live.loading')}</p>}
          {weather.status === 'error' && (
            <p role="alert">{t('live.weatherError')}</p>
          )}
          {weather.data && (
            <div className="live-data-value">
              <strong>{Math.round(weather.data.temperature)}°C</strong>
              <span>{t(weather.data.conditionKey)}</span>
              <p>{t('live.feelsLike')}: {Math.round(weather.data.apparentTemperature)}°C</p>
              <p>{t('live.humidity')}: {weather.data.humidity}%</p>
              <p>{t('live.wind')}: {Math.round(weather.data.windSpeed)} km/h</p>
              <p className="live-data-updated">
                {t('live.updated')}: <time dateTime={weather.data.observedAt.toISOString()}>{formatTime(weather.data.observedAt)}</time>
              </p>
            </div>
          )}
          <p className="live-data-source">
            {t('live.approximateLocation')} <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
          </p>
          <DavaoWeatherMap weather={weather.data} weatherStatus={weather.status} />
        </article>

        <article className="live-data-card">
          <h3>{t('live.exchangeTitle')}</h3>
          {exchangeRate.status === 'loading' && <p role="status">{t('live.loading')}</p>}
          {exchangeRate.status === 'error' && (
            <p role="alert">{t('live.exchangeError')}</p>
          )}
          {exchangeRate.data && (
            <div className="live-data-value">
              <strong>{formatMoney(exchangeRate.data.usdToPhp)}</strong>
              <span>{t('live.usdEquivalent')}</span>
              <p className="live-data-updated">
                {t('live.updated')}: <time dateTime={exchangeRate.data.updatedAt.toISOString()}>{formatTime(exchangeRate.data.updatedAt, 'UTC')}</time>
              </p>
            </div>
          )}
          <p className="live-data-source">
            {t('live.referenceRate')} <a href="https://www.exchangerate-api.com/" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>
          </p>
        </article>

        <article className="live-data-card live-clock-card">
          <h3>{t('live.clockTitle')}</h3>
          <div className="live-data-value">
            <strong><time dateTime={clock.toISOString()}>{new Intl.DateTimeFormat(locale, {
              timeStyle: 'medium',
              timeZone: 'Asia/Manila',
            }).format(clock)}</time></strong>
            <span>{t('live.timeZone')}</span>
            <p>{new Intl.DateTimeFormat(locale, {
              dateStyle: 'full',
              timeZone: 'Asia/Manila',
            }).format(clock)}</p>
          </div>
          <p className="live-data-source">{t('live.deviceClock')}</p>
        </article>
      </div>
      <p className="live-data-disclaimer">{t('live.disclaimer')}</p>
    </section>
  )
}

export default LiveCityInfo
