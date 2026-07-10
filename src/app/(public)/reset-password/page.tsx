'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password updated! Redirecting to loginâ€¦')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        toast.error(data.error ?? 'Reset failed. The link may have expired.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400 font-semibold">Invalid reset link</p>
        <p className="text-gray-400 text-sm mt-2">This link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-[#DC1A2C] hover:underline text-sm">
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DC1A2C] transition-colors"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DC1A2C] transition-colors"
        />
      </div>
      <button
        id="reset-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#DC1A2C] hover:bg-[#A8121F] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Updatingâ€¦' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#050505]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-headline font-black text-2xl mb-6">
            <span className="text-[#DC1A2C]">Dhaka</span>
            <span className="text-white">Chronicles</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Set new password</h1>
          <p className="text-gray-400 mt-2">Choose a strong password for your account.</p>
        </div>
        <Suspense fallback={<div className="text-gray-400 text-center">Loadingâ€¦</div>}>
          <ResetForm />
        </Suspense>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/forgot-password" className="text-[#DC1A2C] hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    </main>
  )
}

