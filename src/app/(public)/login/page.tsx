'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to login')
      }

      toast.success('Login successful')
      router.push(result.redirect || '/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-dc-green rounded-lg mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold font-headline text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-headline font-bold mb-2" style={{ color: 'var(--dc-text)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--dc-text-muted)' }}>Sign in to your editorial account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="form-input"
              placeholder="you@dhakachronicles.com"
            />
            {errors.email && <p className="text-dc-red text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="form-label mb-0" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs text-dc-green hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              {...register('password')}
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-dc-red text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  )
}
