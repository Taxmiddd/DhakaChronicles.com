'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterFormData } from '@/lib/validations'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema) as any
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to register')
      }

      toast.success('Registration successful. Welcome to Dhaka Chronicles.')
      router.push('/admin/dashboard')
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
          <h1 className="text-3xl font-headline font-bold text-white mb-2">Create Account</h1>
          <p className="text-dc-muted">Join the editorial team</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-6 md:p-8 space-y-5">
          <div>
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              {...register('name')}
              id="name"
              className="form-input"
              placeholder="Tahmid Ashfaque"
            />
            {errors.name && <p className="text-dc-red text-sm mt-1">{errors.name.message}</p>}
          </div>

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
            <label className="form-label" htmlFor="password">Password</label>
            <input
              {...register('password')}
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-dc-red text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="role">Role</label>
            <select
              {...register('role')}
              id="role"
              className="form-input appearance-none bg-dc-surface-2"
            >
              <option value="publisher">Publisher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-dc-muted mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-dc-green hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
