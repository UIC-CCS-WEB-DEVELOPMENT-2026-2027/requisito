import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.json' with { type: 'json' }
// These translations are draft strings; fil.json and ceb.json need native-speaker review.
import fil from './fil.json' with { type: 'json' }
import ceb from './ceb.json' with { type: 'json' }
import { resolveTranslation } from './translation.js'

const translations = { en, fil, ceb }
const warnedKeys = new Set()
const LanguageContext = createContext(null)

function storedLanguage() {
  try {
    const saved = window.localStorage.getItem('requisito-language')
    return Object.hasOwn(translations, saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(storedLanguage)

  useEffect(() => {
    document.documentElement.lang = language === 'fil' ? 'fil' : language
  }, [language])

  function changeLanguage(nextLanguage) {
    if (!Object.hasOwn(translations, nextLanguage)) return
    setLanguage(nextLanguage)
    try {
      window.localStorage.setItem('requisito-language', nextLanguage)
    } catch {
      // The selection still applies for the current page if storage is unavailable.
    }
  }

  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t: (key) => resolveTranslation(translations, language, key, (missingKey, currentLanguage) => {
      if (import.meta.env.DEV && !warnedKeys.has(`${currentLanguage}:${missingKey}`)) {
        warnedKeys.add(`${currentLanguage}:${missingKey}`)
        console.warn(`Missing ${currentLanguage} translation for "${missingKey}". Falling back to English.`)
      }
    }),
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.')
  return context
}
