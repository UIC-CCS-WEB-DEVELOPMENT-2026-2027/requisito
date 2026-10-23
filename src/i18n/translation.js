export function resolveTranslation(catalogs, language, key, warn = () => {}) {
  const translation = catalogs[language]?.[key]
  if (translation !== undefined) return translation
  warn(key, language)
  return catalogs.en?.[key] ?? key
}
