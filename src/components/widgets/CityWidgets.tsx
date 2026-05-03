'use client'

import { useEffect, useState } from 'react'
import { Wind, Droplets, Navigation, ExternalLink } from 'lucide-react'
import AdBanner from '@/components/ui/AdBanner'

interface WeatherData {
  location_name?: string
  lat?: number
  lon?: number
  temp: number
  feels_like: number
  humidity: number
  condition: string
  description: string
  icon: string
  wind_speed: number
  aqi: number
  aqi_label: string
  aqi_color: string
  aqi_pm25: number
  live_traffic_available?: boolean
  traffic_level?: string
  traffic_color?: string
  traffic_speed_kmh?: number | null
  congestion_percent?: number | null
  updated_at?: string
}

function WeatherIcon({ icon, size = 32 }: { icon: string; size?: number }) {
  return (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt=""
      width={size}
      height={size}
      className="shrink-0"
    />
  )
}

export function CityWidgets() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 23.8103, lon: 90.4125 })
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLocalData = (lat: number, lon: number) => {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setData(d)
        setLastUpdated(new Date())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    const startPolling = (lat: number, lon: number) => {
      fetchLocalData(lat, lon)
      intervalId = setInterval(() => fetchLocalData(lat, lon), 60_000)
    }

    if (!navigator.geolocation) {
      setLocationAllowed(false)
      startPolling(coords.lat, coords.lon)
      return () => { if (intervalId) clearInterval(intervalId) }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: Number(position.coords.latitude.toFixed(4)),
          lon: Number(position.coords.longitude.toFixed(4)),
        }
        setLocationAllowed(true)
        setCoords(next)
        startPolling(next.lat, next.lon)
      },
      () => {
        setLocationAllowed(false)
        startPolling(coords.lat, coords.lon)
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 120000 }
    )

    return () => { if (intervalId) clearInterval(intervalId) }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        <div className="h-[108px] rounded-xl animate-pulse" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }} />
        <div className="hidden sm:block h-[108px] rounded-xl animate-pulse" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }} />
        <div className="hidden sm:block h-[108px] rounded-xl animate-pulse" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }} />
      </div>
    )
  }

  if (!data) return null

  const mapsUrl = `https://www.google.com/maps/@${data.lat ?? coords.lat},${data.lon ?? coords.lon},13z/data=!5m1!1e1`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">

      {/* ── Compact unified info card ── */}
      <div
        className="rounded-xl px-4 py-3 flex flex-col gap-2"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        {/* Weather */}
        <div className="flex items-center gap-2">
          <WeatherIcon icon={data.icon} size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-black font-headline leading-none" style={{ color: 'var(--dc-text)' }}>
                {data.temp}°C
              </span>
              <span className="text-[11px] capitalize" style={{ color: 'var(--dc-text-muted)' }}>
                {data.description}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'var(--dc-text-muted)' }}>
              <span>Feels {data.feels_like}°C</span>
              <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{data.humidity}%</span>
              <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" />{data.wind_speed} km/h</span>
            </div>
          </div>
          {lastUpdated && (
            <span className="text-[9px] shrink-0 self-start pt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--dc-border)' }} />

        {/* AQI + Traffic in one row */}
        <div className="flex items-center justify-between gap-3">
          {/* AQI */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] font-black"
              style={{ background: `${data.aqi_color}18`, color: data.aqi_color }}
            >
              {data.aqi}
            </div>
            <div>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${data.aqi_color}20`, color: data.aqi_color }}
              >
                {data.aqi_label}
              </span>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
                PM2.5: {data.aqi_pm25} µg/m³
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch" style={{ background: 'var(--dc-border)' }} />

          {/* Traffic */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 group flex-1 justify-end"
          >
            <Navigation className="w-3.5 h-3.5 shrink-0 group-hover:text-dc-green transition-colors" style={{ color: 'var(--dc-text-muted)' }} />
            <div className="text-right">
              {data.live_traffic_available ? (
                <p className="text-[10px] font-medium" style={{ color: data.traffic_color || 'var(--dc-text-muted)' }}>
                  {data.traffic_level} · {data.traffic_speed_kmh ?? '—'} km/h
                </p>
              ) : (
                <p className="text-[10px]" style={{ color: 'var(--dc-text-muted)' }}>
                  {locationAllowed ? 'Your area' : 'Dhaka'}
                </p>
              )}
              <p className="text-[10px] text-dc-green font-medium group-hover:underline flex items-center gap-0.5 justify-end">
                Maps <ExternalLink className="w-2.5 h-2.5" />
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* ── Ad slot mid ── */}
      <div
        className="hidden sm:block rounded-xl overflow-hidden relative"
        style={{
          background: 'var(--dc-surface)',
          border: '1px solid var(--dc-border)',
          minHeight: '108px',
        }}
      >
        <AdBanner position="widget_mid" className="absolute inset-0 w-full h-full rounded-xl" />
        {/* Always-visible fallback label (ad covers it when loaded) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none select-none">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--dc-border)' }}>
            Advertisement
          </span>
        </div>
      </div>

      {/* ── Ad slot right ── */}
      <div
        className="hidden sm:block rounded-xl overflow-hidden relative"
        style={{
          background: 'var(--dc-surface)',
          border: '1px solid var(--dc-border)',
          minHeight: '108px',
        }}
      >
        <AdBanner position="widget_right" className="absolute inset-0 w-full h-full rounded-xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none select-none">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--dc-border)' }}>
            Advertisement
          </span>
        </div>
      </div>
    </div>
  )
}
