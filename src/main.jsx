import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        const checkForUpdates = () => {
          if (document.visibilityState !== 'visible') return
          registration.update().catch((error) => {
            console.error('Requisito could not check for offline-support updates.', error)
          })
        }
        window.addEventListener('focus', checkForUpdates)
        window.addEventListener('online', checkForUpdates)
      })
      .catch((error) => console.error('Requisito offline support could not be enabled.', error))
  }, { once: true })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
