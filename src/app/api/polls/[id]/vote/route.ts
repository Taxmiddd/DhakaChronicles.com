import { supabaseAdmin } from '@/lib/db/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/** POST /api/polls/[id]/vote — vote on a poll */
export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params
  const { option_id } = await req.json().catch(() => ({}))

  if (!option_id) {
    return NextResponse.json({ error: 'Option ID is required' }, { status: 400 })
  }

  // Use IP for guest voting control
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'

  // Check if poll is active
  const { data: poll } = await supabaseAdmin.from('polls').select('is_active, starts_at, ends_at').eq('id', id).single()
  
  if (!poll || !poll.is_active) {
    return NextResponse.json({ error: 'Poll is closed' }, { status: 400 })
  }

  if (poll.starts_at && new Date() < new Date(poll.starts_at)) {
    return NextResponse.json({ error: 'Poll has not started yet' }, { status: 400 })
  }

  if (poll.ends_at && new Date() > new Date(poll.ends_at)) {
    return NextResponse.json({ error: 'Poll has ended' }, { status: 400 })
  }

  // Check if user already voted (by IP)
  const { data: existingVote } = await supabaseAdmin
    .from('poll_votes')
    .select('id')
    .eq('poll_id', id)
    .eq('ip_address', ip)
    .maybeSingle()

  if (existingVote) {
    return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 })
  }

  // Record vote
  const { error: voteError } = await supabaseAdmin.from('poll_votes').insert({
    poll_id: id,
    option_id,
    ip_address: ip,
  })

  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

  const { error: rpcError } = await supabaseAdmin.rpc('increment_poll_vote', { p_poll_id: id, p_option_id: option_id })
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Vote recorded' })
}
