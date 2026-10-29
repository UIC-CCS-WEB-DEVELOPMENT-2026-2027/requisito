const CITY = 'https://davaocity.gov.ph'

export const civicSourceDirectories = Object.freeze({
  government: [
    { id: 'city-services', titleKey: 'civicSource.cityServices.title', descriptionKey: 'civicSource.cityServices.description', url: `${CITY}/more-services/`, checkedOn: '2026-10-27' },
    { id: 'city-departments', titleKey: 'civicSource.departments.title', descriptionKey: 'civicSource.departments.description', url: `${CITY}/know-davao-city/directory-of-davao-city-government-department-heads/`, checkedOn: '2026-10-27' },
    { id: 'city-contact', titleKey: 'civicSource.contact.title', descriptionKey: 'civicSource.contact.description', url: `${CITY}/contact-us/`, checkedOn: '2026-10-27' },
  ],
  history: [
    { id: 'city-history', titleKey: 'civicSource.history.title', descriptionKey: 'civicSource.history.description', url: `${CITY}/know-davao-city/history/`, checkedOn: '2026-10-27' },
  ],
  statistics: [
    { id: 'psa-population-2020', titleKey: 'civicSource.population2020.title', descriptionKey: 'civicSource.population2020.description', url: 'https://psa.gov.ph/content/highlights-region-xi-davao-region-population-2020-census-population-and-housing-2020-cph' },
    { id: 'psa-popcen-2024', titleKey: 'civicSource.population2024.title', descriptionKey: 'civicSource.population2024.description', url: 'https://psa.gov.ph/content/2024-census-population-popcen-population-counts-declared-official-president' },
    { id: 'psa-regional-office', titleKey: 'civicSource.psaRegional.title', descriptionKey: 'civicSource.psaRegional.description', url: 'https://rsso11.psa.gov.ph/' },
  ],
  budget: [
    { id: 'city-reports', titleKey: 'civicSource.cityReports.title', descriptionKey: 'civicSource.cityReports.description', url: `${CITY}/transparency/forms-and-reports/`, checkedOn: '2026-10-27' },
    { id: 'blgf', titleKey: 'civicSource.blgf.title', descriptionKey: 'civicSource.blgf.description', url: 'https://blgf.gov.ph/' },
  ],
  procurement: [
    { id: 'philgeps-awards', titleKey: 'civicSource.philgepsAwards.title', descriptionKey: 'civicSource.philgepsAwards.description', url: 'https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/RecentAwardNoticeUI.aspx?menuIndex=3', checkedOn: '2026-10-27' },
    { id: 'philgeps', titleKey: 'civicSource.philgeps.title', descriptionKey: 'civicSource.philgeps.description', url: 'https://philgeps.gov.ph/', checkedOn: '2026-10-27' },
    { id: 'city-procurement-records', titleKey: 'civicSource.cityReports.title', descriptionKey: 'civicSource.cityReports.description', url: `${CITY}/transparency/forms-and-reports/`, checkedOn: '2026-10-27' },
    { id: 'dpwh-projects', titleKey: 'civicSource.dpwhProjects.title', descriptionKey: 'civicSource.dpwhProjects.description', url: 'https://www.dpwh.gov.ph/dpwh/projects', checkedOn: '2026-10-27' },
  ],
  legislation: [
    { id: 'city-transparency', titleKey: 'civicSource.transparency.title', descriptionKey: 'civicSource.transparency.description', url: `${CITY}/transparency/`, checkedOn: '2026-10-27' },
    { id: 'city-resolutions', titleKey: 'civicSource.resolutions.title', descriptionKey: 'civicSource.resolutions.description', url: `${CITY}/transparency/resolution/`, checkedOn: '2026-10-27' },
    { id: 'city-council', titleKey: 'civicSource.cityCouncil.title', descriptionKey: 'civicSource.cityCouncil.description', url: `${CITY}/know-davao-city/21st-city-council/`, checkedOn: '2026-10-27' },
    { id: 'city-executive-orders', titleKey: 'civicSource.executiveOrders.title', descriptionKey: 'civicSource.executiveOrders.description', url: `${CITY}/transparency/executive-orders/`, checkedOn: '2026-10-27' },
    { id: 'city-charter', titleKey: 'civicSource.charter.title', descriptionKey: 'civicSource.charter.description', url: `${CITY}/transparency/citizens-charter-handbook/`, checkedOn: '2026-10-27' },
    { id: 'city-certificates', titleKey: 'civicSource.compliance.title', descriptionKey: 'civicSource.compliance.description', url: `${CITY}/transparency/certificate-of-compliance/`, checkedOn: '2026-10-27' },
  ],
  publicRecords: [
    { id: 'city-transparency', titleKey: 'civicSource.transparency.title', descriptionKey: 'civicSource.transparency.description', url: `${CITY}/transparency/`, checkedOn: '2026-10-27' },
    { id: 'city-reports', titleKey: 'civicSource.cityReports.title', descriptionKey: 'civicSource.cityReports.description', url: `${CITY}/transparency/forms-and-reports/`, checkedOn: '2026-10-27' },
    { id: 'city-resolutions', titleKey: 'civicSource.resolutions.title', descriptionKey: 'civicSource.resolutions.description', url: `${CITY}/transparency/resolution/`, checkedOn: '2026-10-27' },
    { id: 'city-executive-orders', titleKey: 'civicSource.executiveOrders.title', descriptionKey: 'civicSource.executiveOrders.description', url: `${CITY}/transparency/executive-orders/`, checkedOn: '2026-10-27' },
    { id: 'city-certificates', titleKey: 'civicSource.compliance.title', descriptionKey: 'civicSource.compliance.description', url: `${CITY}/transparency/certificate-of-compliance/`, checkedOn: '2026-10-27' },
  ],
  documentLookup: [
    { id: 'city-charter', titleKey: 'civicSource.charter.title', descriptionKey: 'civicSource.charter.description', url: `${CITY}/transparency/citizens-charter-handbook/`, checkedOn: '2026-10-27' },
    { id: 'city-reports', titleKey: 'civicSource.cityReports.title', descriptionKey: 'civicSource.cityReports.description', url: `${CITY}/transparency/forms-and-reports/`, checkedOn: '2026-10-27' },
  ],
  updates: [
    { id: 'city-news', titleKey: 'civicSource.cityNews.title', descriptionKey: 'civicSource.cityNews.description', url: `${CITY}/news/`, checkedOn: '2026-10-27' },
  ],
})
