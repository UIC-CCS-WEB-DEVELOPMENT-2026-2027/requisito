import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function InstallAppButton() {
  const { t } = useLanguage()
  const [installPrompt, setInstallPrompt] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    function handleInstallAvailable(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleInstalled() {
      setInstallPrompt(null)
      setStatus(t('pwa.installed'))
    }

    window.addEventListener('beforeinstallprompt', handleInstallAvailable)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [t])

  async function installApp() {
    if (!installPrompt) return
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setStatus(choice.outcome === 'accepted' ? t('pwa.installed') : t('pwa.dismissed'))
    } catch (error) {
      console.error('Requisito install prompt failed.', error)
      setStatus(t('pwa.installError'))
    } finally {
      setInstallPrompt(null)
    }
  }

  return (
    <>
      {installPrompt && (
        <button className="install-app-button" type="button" onClick={installApp}>
          {t('pwa.install')}
        </button>
      )}
      {status && <span className="visually-hidden" role="status">{status}</span>}
    </>
  )
}

export default InstallAppButton
