import { getVerifiedHotlines } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function VerifiedHotlineTicker() {
  const { t } = useLanguage()
  const hotlines = getVerifiedHotlines()
  if (hotlines.length === 0) return null

  return (
    <aside className="hotline-ticker" aria-label={t('hotline.label')}>
      <strong>{t('hotline.label')}</strong>
      <ul>
        {hotlines.flatMap((service) => service.contact.phone.map((phone) => {
          const telephone = phone.replace(/[\s().-]/gu, '')
          const isDialable = /^\+?\d+$/u.test(telephone)
          return (
            <li key={`${service.id}-${phone}`}>
              <span>{service.title}</span>
              {isDialable
                ? <a href={`tel:${telephone}`}>{phone}</a>
                : <span>{phone}</span>}
            </li>
          )
        }))}
      </ul>
    </aside>
  )
}

export default VerifiedHotlineTicker
