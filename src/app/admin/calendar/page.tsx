'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar, X, Loader2 } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday,
} from 'date-fns'
import { toast } from 'sonner'

interface CalendarEvent {
  id: string
  title: string
  event_type: string
  start_date: string
  color?: string
}

const TYPE_COLORS: Record<string, string> = {
  article_deadline: '#F42A41',
  scheduled_publish: '#00A651',
  meeting: '#F59E0B',
  event_coverage: '#8B5CF6',
}

const EMPTY_FORM = { title: '', event_type: 'article_deadline', start_date: '' }

export default function EditorialCalendarPage() {
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const from = format(startOfMonth(current), 'yyyy-MM-dd')
      const to = format(endOfMonth(current), 'yyyy-MM-dd')
      const res = await fetch(`/api/admin/calendar?from=${from}&to=${to}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [current])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const weeks = (() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start, end })
    const wks: Date[][] = []
    for (let i = 0; i < days.length; i += 7) wks.push(days.slice(i, i + 7))
    return wks
  })()

  const eventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.start_date), day))

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Event added')
      setShowAdd(false)
      setForm(EMPTY_FORM)
      fetchEvents()
    } catch {
      toast.error('Failed to add event')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/calendar?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Event removed')
      setEvents(prev => prev.filter(ev => ev.id !== id))
    } catch {
      toast.error('Failed to remove event')
    } finally {
      setDeletingId(null)
    }
  }

  function openAddForDay(day: Date) {
    setSelectedDay(day)
    setForm({ ...EMPTY_FORM, start_date: format(day, "yyyy-MM-dd'T'HH:mm") })
    setShowAdd(true)
  }

  const dayEvents = selectedDay ? eventsForDay(selectedDay) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-dc-green" /> Editorial Calendar
          </h1>
          <p className="text-dc-muted text-sm mt-1">Plan deadlines, scheduled publishes, and team events.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 hover:bg-dc-surface-2 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-dc-muted" />
        </button>
        <h2 className="text-xl font-headline font-bold text-white">{format(current, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 hover:bg-dc-surface-2 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-dc-muted" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass rounded-xl overflow-hidden border border-dc-border">
        <div className="grid grid-cols-7 bg-dc-surface-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-dc-muted text-center border-b border-dc-border">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-dc-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-dc-green" /> Loading…
          </div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-dc-border last:border-0">
              {week.map(day => {
                const dayEvents = eventsForDay(day)
                const inMonth = isSameMonth(day, current)
                const today = isToday(day)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[100px] p-2 border-r border-dc-border last:border-0 cursor-pointer transition-colors
                      ${inMonth ? 'hover:bg-dc-surface-2/50' : 'opacity-40'}
                      ${isSelected ? 'ring-1 ring-inset ring-dc-green' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                      ${today ? 'bg-dc-green text-white' : inMonth ? 'text-white' : 'text-dc-muted'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className="text-xs px-1.5 py-0.5 rounded truncate font-medium group/ev flex items-center gap-1"
                          style={{
                            backgroundColor: `${TYPE_COLORS[ev.event_type] ?? '#6b7280'}22`,
                            color: TYPE_COLORS[ev.event_type] ?? '#9ca3af',
                          }}
                        >
                          <span className="flex-1 truncate">{ev.title}</span>
                          <button
                            onClick={(e) => deleteEvent(ev.id, e)}
                            disabled={deletingId === ev.id}
                            className="shrink-0 opacity-0 group-hover/ev:opacity-100 hover:text-white transition-opacity"
                          >
                            {deletingId === ev.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-dc-muted">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                    {inMonth && dayEvents.length === 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openAddForDay(day) }}
                        className="opacity-0 hover:opacity-100 w-full text-center text-dc-muted hover:text-dc-green text-xs mt-1 transition-opacity"
                      >
                        + add
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-dc-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {type.replace(/_/g, ' ')}
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-headline font-bold text-white">Add Calendar Event</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 text-dc-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addEvent} className="space-y-4">
              <div>
                <label className="form-label">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Budget 2026 Deadline"
                />
              </div>
              <div>
                <label className="form-label">Event Type</label>
                <select
                  value={form.event_type}
                  onChange={e => setForm({ ...form, event_type: e.target.value })}
                  className="form-input"
                >
                  <option value="article_deadline">Article Deadline</option>
                  <option value="scheduled_publish">Scheduled Publish</option>
                  <option value="meeting">Meeting</option>
                  <option value="event_coverage">Event Coverage</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date &amp; Time *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Adding…' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
