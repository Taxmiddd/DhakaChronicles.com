'use client'

import { useEffect, useState } from 'react'
import { Wind, Droplets } from 'lucide-react'
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
      <div className="flex gap-3 mb-5">
        <div className="h-[88px] w-full max-w-xs rounded-xl animate-pulse" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mb-5">
      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        {/* Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <WeatherIcon icon={data.icon} size={36} />
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-headline leading-none" style={{ color: 'var(--dc-text)' }}>
                  {data.temp}°C
                </span>
                <span className="text-[11px] capitalize" style={{ color: 'var(--dc-text-muted)' }}>
                  {data.description}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'var(--dc-text-muted)' }}>
                <span>Feels {data.feels_like}°C</span>
                <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{data.humidity}%</span>
                <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" />{data.wind_speed} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'var(--dc-border)' }} />

        {/* AQI & Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          {lastUpdated && (
            <span className="text-[9px] text-right" style={{ color: 'var(--dc-text-muted)' }}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
