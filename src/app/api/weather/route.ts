import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limit'

const OWM_KEY = process.env.OPENWEATHERMAP_API_KEY
const TOMTOM_KEY = process.env.TOMTOM_API_KEY
const DHAKA_LAT = 23.8103
const DHAKA_LON = 90.4125

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Good',      color: '#00A651' },
  2: { label: 'Fair',      color: '#84cc16' },
  3: { label: 'Moderate',  color: '#F59E0B' },
  4: { label: 'Poor',      color: '#F97316' },
  5: { label: 'Very Poor', color: '#F42A41' },
}

export const dynamic = 'force-dynamic'

function parseCoord(value: string | null, min: number, max: number, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  if (n < min || n > max) return fallback
  return n
}

function trafficLevel(congestionPercent: number) {
  if (congestionPercent <= 20) return { label: 'Light', color: '#00A651' }
  if (congestionPercent <= 45) return { label: 'Moderate', color: '#F59E0B' }
  return { label: 'Heavy', color: '#F42A41' }
}

export async function GET(request: Request) {
  // Protect external weather/traffic API credits
  const rateLimitError = rateLimit(request, 20, 60000, 'weather-read')
  if (rateLimitError) return rateLimitError

  if (!OWM_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const lat = parseCoord(searchParams.get('lat'), -90, 90, DHAKA_LAT)
    const lon = parseCoord(searchParams.get('lon'), -180, 180, DHAKA_LON)

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`, { cache: 'no-store' }),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`, { cache: 'no-store' }),
    ])

    if (!weatherRes.ok || !aqiRes.ok) {
      throw new Error('Upstream weather provider failed')
    }

    const [weather, aqi] = await Promise.all([weatherRes.json(), aqiRes.json()])
    const locationName = weather.name || 'Current location'

    const aqiIndex: number = aqi?.list?.[0]?.main?.aqi ?? 3
    const aqiInfo = AQI_LABELS[aqiIndex] ?? AQI_LABELS[3]

    let traffic = {
      live_traffic_available: false,
      traffic_level: 'Unknown',
      traffic_color: '#9CA3AF',
      traffic_speed_kmh: null as number | null,
      free_flow_speed_kmh: null as number | null,
      congestion_percent: null as number | null,
      traffic_source: 'google_maps_live_layer',
    }

    if (TOMTOM_KEY) {
      const trafficRes = await fetch(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${TOMTOM_KEY}`,
        { cache: 'no-store' }
      )
      if (trafficRes.ok) {
        const trafficData = await trafficRes.json()
        const segment = trafficData?.flowSegmentData
        const currentSpeed = Number(segment?.currentSpeed)
        const freeFlowSpeed = Number(segment?.freeFlowSpeed)
        if (Number.isFinite(currentSpeed) && Number.isFinite(freeFlowSpeed) && freeFlowSpeed > 0) {
          const congestionPercent = Math.max(0, Math.min(100, Math.round((1 - currentSpeed / freeFlowSpeed) * 100)))
          const level = trafficLevel(congestionPercent)
          traffic = {
            live_traffic_available: true,
            traffic_level: level.label,
            traffic_color: level.color,
            traffic_speed_kmh: Math.round(currentSpeed),
            free_flow_speed_kmh: Math.round(freeFlowSpeed),
            congestion_percent: congestionPercent,
            traffic_source: 'tomtom_flow',
          }
        }
      }
    }

    return NextResponse.json({
      location_name: locationName,
      lat,
      lon,
      temp: Math.round(weather.main?.temp ?? 30),
      feels_like: Math.round(weather.main?.feels_like ?? 30),
      humidity: weather.main?.humidity ?? 0,
      condition: weather.weather?.[0]?.main ?? 'Clear',
      description: weather.weather?.[0]?.description ?? '',
      icon: weather.weather?.[0]?.icon ?? '01d',
      wind_speed: Math.round((weather.wind?.speed ?? 0) * 3.6), // m/s → km/h
      aqi: aqiIndex,
      aqi_label: aqiInfo.label,
      aqi_color: aqiInfo.color,
      aqi_pm25: Math.round(aqi?.list?.[0]?.components?.pm2_5 ?? 0),
      ...traffic,
      updated_at: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
