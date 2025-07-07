import React from 'react'
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Login from './page'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // If user is not authenticated, show login page
  if (!user) {
    return (
      <html lang="en">
        <body>
          <Login />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}