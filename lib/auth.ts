import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM,
      // Custom sendVerificationRequest to log URLs when SMTP fails
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        console.log("🔗 Magic Link for", identifier, ":", url)
        
        // Try to send email if SMTP is configured, otherwise just log
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          // Use default email sending
          const nodemailer = await import("nodemailer")
          const transport = nodemailer.createTransport(provider.server)
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: "Sign in to MartianTinder",
            text: `Sign in to MartianTinder: ${url}`,
            html: `<p>Click <a href="${url}">here</a> to sign in to MartianTinder</p>`,
          })
        } else {
          console.log("⚠️ SMTP not configured - use the magic link above to sign in")
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}) 