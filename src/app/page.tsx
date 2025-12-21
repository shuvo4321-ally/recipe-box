// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  // Automatically redirect the user to the login page
  redirect('/login')
}