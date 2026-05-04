import React from 'react'

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false

  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']

  // Check screen width (common mobile breakpoint)
  const isSmallScreen = window.innerWidth < 768

  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  return mobileKeywords.some(keyword => userAgent.includes(keyword)) || (isSmallScreen && hasTouch)
}

export function useIsMobile(): boolean {
  const [isMobileDevice, setIsMobileDevice] = React.useState(false)

  React.useEffect(() => {
    setIsMobileDevice(isMobile())

    const handleResize = () => {
      setIsMobileDevice(isMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobileDevice
}