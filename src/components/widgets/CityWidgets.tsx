'use client'

import { useEffect, useState } from 'react'
import { Wind, Droplets, Thermometer, Navigation } from 'lucide-react'

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
  free_flow_speed_kmh?: number | null
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
      <div className="flex gap-3 mb-6">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-[88px] flex-1 rounded-xl animate-pulse"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
          />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">

      {/* ── Weather ── */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        <WeatherIcon icon={data.icon} size={48} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-headline" style={{ color: 'var(--dc-text)' }}>
              {data.temp}°
            </span>
            <span className="text-xs" style={{ color: 'var(--dc-text-muted)' }}>C</span>
          </div>
          <p className="text-xs font-medium capitalize truncate" style={{ color: 'var(--dc-text)' }}>
            {data.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{ color: 'var(--dc-text-muted)' }}>
            <span className="flex items-center gap-0.5">
              <Droplets className="w-3 h-3" /> {data.humidity}%
            </span>
            <span className="flex items-center gap-0.5">
              <Wind className="w-3 h-3" /> {data.wind_speed} km/h
            </span>
          </div>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--dc-text-muted)' }}>
            {data.location_name || 'Current area'}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
            Feels {data.feels_like}°C
          </p>
          {lastUpdated && (
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* ── AQI ── */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        <div
          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
          style={{ background: `${data.aqi_color}18` }}
        >
          <span className="text-xl font-black font-headline" style={{ color: data.aqi_color }}>
            {data.aqi}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${data.aqi_color}20`, color: data.aqi_color }}
            >
              {data.aqi_label}
            </span>
          </div>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--dc-text)' }}>
            Air Quality
          </p>
          <p className="text-[11px]" style={{ color: 'var(--dc-text-muted)' }}>
            PM2.5: {data.aqi_pm25} µg/m³
          </p>
        </div>
        {/* AQI bar */}
        <div className="w-2 self-stretch rounded-full overflow-hidden shrink-0" style={{ background: 'var(--dc-surface-2)' }}>
          <div
            className="rounded-full transition-all"
            style={{
              background: data.aqi_color,
              height: `${(data.aqi / 5) * 100}%`,
              marginTop: 'auto',
            }}
          />
        </div>
      </div>

      {/* ── Traffic ── */}
      <a
        href={`https://www.google.com/maps/@${data.lat ?? coords.lat},${data.lon ?? coords.lon},13z/data=!5m1!1e1`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl px-4 py-3 flex items-center gap-3 group transition-all hover:border-dc-green"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        <div
          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-colors"
          style={{ background: 'var(--dc-surface-2)' }}
        >
          <Navigation className="w-5 h-5 group-hover:text-dc-green transition-colors" style={{ color: 'var(--dc-text-muted)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--dc-text)' }}>Live Traffic</p>
          {data.live_traffic_available ? (
            <p className="text-[11px]" style={{ color: data.traffic_color || 'var(--dc-text-muted)' }}>
              {data.traffic_level} · {data.traffic_speed_kmh ?? '—'} km/h
              {typeof data.congestion_percent === 'number' ? ` · ${data.congestion_percent}% congestion` : ''}
            </p>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--dc-text-muted)' }}>
              {locationAllowed ? 'Traffic layer for your area' : 'Traffic layer (Dhaka fallback)'}
            </p>
          )}
          <p className="text-[11px] text-dc-green mt-0.5 font-medium group-hover:underline">
            View on Google Maps →
          </p>
        </div>
      </a>
    </div>
  )
}
