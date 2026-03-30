import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectToParam = requestUrl.searchParams.get('redirectTo');
  const redirectTo =
    redirectToParam && redirectToParam.startsWith('/') && !redirectToParam.startsWith('//')
      ? redirectToParam
      : '/';

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
