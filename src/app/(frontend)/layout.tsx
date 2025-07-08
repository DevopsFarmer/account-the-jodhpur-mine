import React from 'react'
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Login from './login/page'
import Header from './Navbar/Header'
export const metadata = {
  description: '',
  title: 'ARUNA',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-black">
          {user && <Header />}
          {!user && <Login />}
          {user && <main className="flex-1">{children}</main>}
      </body>
    </html>
  )
}