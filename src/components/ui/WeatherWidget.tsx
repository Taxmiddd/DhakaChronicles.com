'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, Loader2, Wind, MapPin, AlertTriangle } from 'lucide-react'

interface WeatherData {
  temperature: number
  weathercode: number
  aqi: number
  locationName: string
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from Open-Meteo
  const fetchWeatherAndAQI = async (lat: number, lon: number) => {
    try {
      // Free Reverse Geocoding via Nominatim to get city name
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      const geoData = await geoRes.json()
      const locationName = geoData.address.city || geoData.address.town || geoData.address.village || 'Current Location'

      // Open-Meteo Weather
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      const weatherData = await weatherRes.json()

      // Open-Meteo Air Quality
      const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`)
      const aqiData = await aqiRes.json()

      setData({
        temperature: Math.round(weatherData.current_weather.temperature),
        weathercode: weatherData.current_weather.weathercode,
        aqi: Math.round(aqiData.current.us_aqi),
        locationName
      })
    } catch (err) {
      console.error(err)
      setError('Failed to fetch weather data.')
    } finally {
      setLoading(false)
    }
  }

  // Get User Location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndAQI(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          console.error(err)
          // Default to Dhaka if user denies location
          fetchWeatherAndAQI(23.8103, 90.4125)
        }
      )
    } else {
      // Default to Dhaka
      fetchWeatherAndAQI(23.8103, 90.4125)
    }
  }, [])

  // Weather Code to Icon Map
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-10 h-10 text-amber-400" />
    if (code >= 1 && code <= 3) return <Cloud className="w-10 h-10 text-slate-300" />
    if (code >= 51) return <CloudRain className="w-10 h-10 text-blue-400" />
    return <Cloud className="w-10 h-10 text-slate-300" />
  }

  // AQI Level Color
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-dc-red'
    if (aqi <= 100) return 'text-amber-400'
    if (aqi <= 150) return 'text-orange-500'
    if (aqi <= 200) return 'text-dc-red'
    return 'text-purple-600'
  }

  const getAQIText = (aqi: number) => {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl flex items-center justify-center h-32 border border-dc-border">
        <Loader2 className="w-6 h-6 animate-spin text-dc-red" />
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  return (
    <div className="glass p-6 rounded-xl border border-dc-border shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-dc-red" />
        <h3 className="font-headline font-bold text-white uppercase tracking-wider text-sm">
          {data.locationName}
        </h3>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getWeatherIcon(data.weathercode)}
          <div>
            <div className="text-3xl font-bold text-white tracking-tighter">
              {data.temperature}&deg;C
            </div>
            <p className="text-xs text-dc-text-muted mt-0.5">Current Temp</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-dc-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className={`w-4 h-4 ${getAQIColor(data.aqi)}`} />
            <span className="text-sm text-dc-text">Air Quality (AQI)</span>
          </div>
          <span className={`text-sm font-bold ${getAQIColor(data.aqi)}`}>
            {data.aqi}
          </span>
        </div>
        <p className="text-xs text-dc-text-muted mt-1 text-right">
          {getAQIText(data.aqi)}
        </p>
      </div>
    </div>
  )
}

