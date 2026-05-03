import { NextResponse } from 'next/server'

const OWM_KEY = process.env.OPENWEATHERMAP_API_KEY
const DHAKA_LAT = 23.8103
const DHAKA_LON = 90.4125

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Good',      color: '#00A651' },
  2: { label: 'Fair',      color: '#84cc16' },
  3: { label: 'Moderate',  color: '#F59E0B' },
  4: { label: 'Poor',      color: '#F97316' },
  5: { label: 'Very Poor', color: '#F42A41' },
}

export const revalidate = 1800 // 30 min

export async function GET() {
  if (!OWM_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${DHAKA_LAT}&lon=${DHAKA_LON}&appid=${OWM_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${DHAKA_LAT}&lon=${DHAKA_LON}&appid=${OWM_KEY}`),
    ])

    const [weather, aqi] = await Promise.all([weatherRes.json(), aqiRes.json()])

    const aqiIndex: number = aqi?.list?.[0]?.main?.aqi ?? 3
    const aqiInfo = AQI_LABELS[aqiIndex] ?? AQI_LABELS[3]

    return NextResponse.json({
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
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
