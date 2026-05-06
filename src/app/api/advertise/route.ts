/*
 * Run once in Supabase SQL editor to create the inquiries table:
 *
 * CREATE TABLE IF NOT EXISTS ad_inquiries (
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at  timestamptz DEFAULT now(),
 *   name        text NOT NULL,
 *   email       text NOT NULL,
 *   company     text,
 *   budget      text,
 *   message     text NOT NULL,
 *   status      text NOT NULL DEFAULT 'new'  -- new | contacted | closed
 * );
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'

export async function POST(req: Request) {
  try {
    const { name, email, company, budget, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('ad_inquiries')
      .insert({ name: name.trim(), email: email.trim(), company: company?.trim() || null, budget: budget || null, message: message.trim() })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to submit.' }, { status: 500 })
  }
}
