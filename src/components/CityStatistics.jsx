import { getCityStatistics } from '../utils/cityStatistics.js'
import cityFacts from '../data/cityFacts.json'
import barangays from '../data/barangays.json'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function BarChart({ id, title, description, items, labelFor, sourcesFor, t }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const rowHeight = 42
  const chartHeight = Math.max(100, items.length * rowHeight + 24)

  return (
    <figure className="statistics-figure">
      <h2>{t(title)}</h2>
      <svg
        className="statistics-chart"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        viewBox={`0 0 760 ${chartHeight}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <title id={`${id}-title`}>{t(title)}</title>
        <desc id={`${id}-description`}>{t(description)}</desc>
        {items.map((item, index) => {
          const y = index * rowHeight + 8
          const barWidth = Math.max(2, (item.value / maxValue) * 720)
          return (
            <g key={item.id}>
              <rect
                className="statistics-chart-bar"
                x="0"
                y={y}
                width={barWidth}
                height="22"
                rx="3"
              />
            </g>
          )
        })}
      </svg>
      <ul className="statistics-source-list">
        {items.map((item) => (
          <li key={item.id}>
            <span>{labelFor(item)}: {new Intl.NumberFormat('en-PH').format(item.value)} — {t('statistics.unverified')}</span>
            {sourcesFor(item).map((sourceUrl) => (
              <a key={sourceUrl} href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {t('statistics.source')}
              </a>
            ))}
          </li>
        ))}
      </ul>
    </figure>
  )
}

function CityStatistics() {
  const { t } = useLanguage()
  const { population, barangayEntriesByDistrict } = getCityStatistics(cityFacts, barangays)

  return (
    <section className="city-statistics" aria-labelledby="statistics-data-title">
      <h2 id="statistics-data-title">{t('statistics.dataTitle')}</h2>
      <p>{t('statistics.disclaimer')}</p>
      {population.length > 0 && (
        <BarChart
          id="population-chart"
          title="statistics.populationChart"
          description="statistics.populationChartDescription"
          items={population}
          labelFor={(item) => t(item.labelKey)}
          sourcesFor={(item) => [item.sourceUrl]}
          t={t}
        />
      )}
      {barangayEntriesByDistrict.length > 0 && (
        <BarChart
          id="barangay-district-chart"
          title="statistics.barangaysChart"
          description="statistics.barangaysChartDescription"
          items={barangayEntriesByDistrict}
          labelFor={(item) => item.label}
          sourcesFor={(item) => item.sourceUrls}
          t={t}
        />
      )}
      <p className="sample-notice">{t('statistics.catalogCountNote')}</p>
    </section>
  )
}

export default CityStatistics
