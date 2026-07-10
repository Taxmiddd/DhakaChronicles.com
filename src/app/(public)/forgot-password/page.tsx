'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        toast.success(data.message)
      } else {
        toast.error(data.error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#050505]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-headline font-black text-2xl mb-6">
            <span className="text-[#DC1A2C]">Dhaka</span>
            <span className="text-white">Chronicles</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Forgot password?</h1>
          <p className="text-gray-400 mt-2">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="bg-[#DC1A2C]/10 border border-[#DC1A2C]/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">ðŸ“§</div>
            <p className="text-white font-semibold">Check your inbox</p>
            <p className="text-gray-400 text-sm mt-2">
              If <strong>{email}</strong> has an account, a password reset link has been sent.
            </p>
            <Link href="/login" className="inline-block mt-4 text-[#DC1A2C] hover:underline text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DC1A2C] transition-colors"
              />
            </div>
            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#DC1A2C] hover:bg-[#A8121F] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Sendingâ€¦' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="text-[#DC1A2C] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}

