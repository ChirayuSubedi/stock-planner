import { redirect } from 'next/navigation'

// Root → dashboard. Middleware handles the auth check.
export default function RootPage() {
  redirect('/dashboard')
}
