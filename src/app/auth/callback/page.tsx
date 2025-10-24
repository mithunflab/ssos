import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const code = (searchParams?.code as string) || null

  if (!code) {
    console.error('❌ No code present in callback URL (page)')
    redirect('/login?error=no_code')
  }

  // Delegate to API route that exchanges the code and sets cookies server-side
  redirect(`/api/auth/callback?code=${encodeURIComponent(code)}`)
}
