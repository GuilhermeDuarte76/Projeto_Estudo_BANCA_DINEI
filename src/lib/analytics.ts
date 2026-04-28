declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (command: string, ...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined

export function initAnalytics(): void {
  if (!GA_ID) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}

export function trackEvent(event: string, params?: Record<string, string | number>): void {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', event, params)
}
