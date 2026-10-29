import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const DAVAO_CITY_REFERENCE_POINT = [7.0731, 125.6128]

function DavaoWeatherMap({ weather, weatherStatus }) {
  const { t } = useLanguage()
  const mapElement = useRef(null)
  const marker = useRef(null)
  const [mapStatus, setMapStatus] = useState('loading')
  const [tilesFailed, setTilesFailed] = useState(false)

  useEffect(() => {
    let active = true
    let map

    import('leaflet')
      .then(({ default: leaflet }) => {
        if (!active || !mapElement.current) return
        map = leaflet.map(mapElement.current, {
          scrollWheelZoom: false,
          attributionControl: false,
        }).setView(DAVAO_CITY_REFERENCE_POINT, 12)

        const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        })
        tiles.on('tileerror', () => {
          if (active) setTilesFailed(true)
        })
        tiles.addTo(map)
        marker.current = leaflet.circleMarker(DAVAO_CITY_REFERENCE_POINT, {
          radius: 9,
          color: '#001f54',
          fillColor: '#2e7d5b',
          fillOpacity: 1,
          weight: 3,
        }).addTo(map)
        setMapStatus('ready')
      })
      .catch(() => {
        if (active) setMapStatus('error')
      })

    return () => {
      active = false
      marker.current = null
      map?.remove()
    }
  }, [])

  useEffect(() => {
    if (!marker.current) return
    const description = weather
      ? `${Math.round(weather.temperature)}°C · ${t(weather.conditionKey)}`
      : t('weather.mapReferencePoint')
    marker.current.unbindTooltip().bindTooltip(description, { permanent: true, direction: 'top' })
  }, [mapStatus, weather, t])

  return (
    <section className="weather-map-section" aria-labelledby="weather-map-title">
      <h3 id="weather-map-title">{t('weather.mapTitle')}</h3>
      <p>{t('weather.mapDescription')}</p>
      {mapStatus === 'loading' && <p role="status">{t('weather.mapLoading')}</p>}
      {mapStatus === 'error' && <p role="alert">{t('weather.mapUnavailable')}</p>}
      {weatherStatus === 'error' && <p role="status">{t('weather.mapWeatherFallback')}</p>}
      {tilesFailed && <p role="status">{t('weather.mapTilesFallback')}</p>}
      <div
        ref={mapElement}
        className="davao-weather-map"
        role="region"
        aria-label={t('weather.mapAccessibleName')}
        tabIndex="0"
      />
      <p className="live-data-source">
        {t('weather.mapAttribution')}{' © '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
        {' contributors.'}
      </p>
      <p><a href="https://www.openstreetmap.org/#map=12/7.0731/125.6128" target="_blank" rel="noopener noreferrer">{t('weather.mapOpenFallback')}</a></p>
    </section>
  )
}

export default DavaoWeatherMap
