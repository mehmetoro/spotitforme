import { redirect } from 'next/navigation'

export default function HelpGivenPage() {
  redirect('/profile?tab=helps')
}
