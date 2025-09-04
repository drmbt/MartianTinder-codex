import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { auth } from "@/lib/auth"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MartianTinder",
  description: "Community organization app for coordinating proposals and events",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
