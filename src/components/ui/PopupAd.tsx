'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import type { PopupAd } from '@/types'

// We initialize a client Supabase instance to fetch the popup ad.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function PopupAdManager() {
  const [ad, setAd] = useState<PopupAd | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function checkAndFetchAd() {
      // 1. Fetch active ad from Supabase
      const { data, error } = await supabase
        .from('popup_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return

      const activeAd = data as PopupAd

      // 2. Check localStorage for frequency
      const storageKey = `dc_popup_ad_${activeAd.id}`
      const lastSeen = localStorage.getItem(storageKey)
      const now = Date.now()

      let shouldShow = false
      if (!lastSeen) {
        shouldShow = true
      } else {
        const lastSeenTime = parseInt(lastSeen, 10)
        if (activeAd.display_frequency === 'always') {
          shouldShow = true
        } else if (activeAd.display_frequency === 'once_per_session') {
          shouldShow = !sessionStorage.getItem(storageKey)
        } else if (activeAd.display_frequency === 'once_per_day') {
          const oneDay = 24 * 60 * 60 * 1000
          shouldShow = now - lastSeenTime > oneDay
        } else if (activeAd.display_frequency === 'once_per_week') {
          const oneWeek = 7 * 24 * 60 * 60 * 1000
          shouldShow = now - lastSeenTime > oneWeek
        }
      }

      if (shouldShow) {
        setAd(activeAd)
        // Delay opening for aesthetic pacing
        setTimeout(() => setIsVisible(true), 1500)
        
        // Update storage
        localStorage.setItem(storageKey, now.toString())
        if (activeAd.display_frequency === 'once_per_session') {
          sessionStorage.setItem(storageKey, 'true')
        }
      }
    }

    checkAndFetchAd()
  }, [])

  if (!ad || !isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsVisible(false)}
      />
      <div 
        className="relative bg-dc-surface border border-dc-border rounded-2xl shadow-2xl overflow-hidden max-w-[600px] w-full animate-in fade-in zoom-in-95 duration-300"
      >
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#DC1A2C] transition-colors z-10"
          aria-label="Close Ad"
        >
          <X className="w-4 h-4" />
        </button>
        
        {ad.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noreferrer" onClick={() => setIsVisible(false)} className="block relative aspect-video bg-dc-surface-2 group">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-2 py-1 rounded bg-[#DC1A2C] text-white text-[10px] font-bold uppercase tracking-widest mb-2">Sponsor</span>
              <h3 className="text-xl sm:text-2xl font-headline font-black text-white leading-tight">{ad.title}</h3>
            </div>
          </a>
        ) : (
          <div className="relative aspect-video bg-dc-surface-2 group">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-2 py-1 rounded bg-[#DC1A2C] text-white text-[10px] font-bold uppercase tracking-widest mb-2">Sponsor</span>
              <h3 className="text-xl sm:text-2xl font-headline font-black text-white leading-tight">{ad.title}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
