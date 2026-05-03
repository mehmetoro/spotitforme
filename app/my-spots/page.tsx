import { redirect } from 'next/navigation'

export default function MySpotsPage() {
  redirect('/profile?tab=spots')
}
