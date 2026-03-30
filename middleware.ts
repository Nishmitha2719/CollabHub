import { NextResponse } from 'next/server';

export async function middleware() {
  // Auth is handled client-side in this app. Keeping middleware as pass-through
  // prevents redirect loops when Supabase browser sessions are not available as server cookies.
  return NextResponse.next();
}