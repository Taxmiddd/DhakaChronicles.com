import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import NotFoundContent from '@/app/(public)/not-found'

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full">
        <NotFoundContent />
      </main>
      <PublicFooter />
    </div>
  )
}
