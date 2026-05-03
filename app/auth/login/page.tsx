import { redirect } from 'next/navigation'

export default function LegacyAuthLoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const target = typeof searchParams?.redirect === 'string' ? searchParams.redirect : '/'
  const encodedTarget = target.startsWith('/') ? target : '/'
  redirect(`/auth?mode=login&redirect=${encodeURIComponent(encodedTarget)}`)
}
