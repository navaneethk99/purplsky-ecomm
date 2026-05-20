import type { User } from '@/payload-types'
import type { PayloadRequest } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

const getVerificationCompletionURL = (token: string) => {
  const baseURL = getServerSideURL()
  const verificationURL = new URL('/verify-email', baseURL)

  verificationURL.searchParams.set('token', token)

  return verificationURL.toString()
}

export const generateVerificationEmailSubject = async () => 'Verify your email address'

export const generateVerificationEmailHTML = async ({
  token,
  user,
}: {
  req: PayloadRequest
  token: string
  user: User
}) => {
  const verificationURL = getVerificationCompletionURL(token)
  const displayName = user.name || user.email

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Hi ${displayName},</p>
      <p>Click the button below to verify your email address and sign in to your account.</p>
      <p style="margin: 24px 0;">
        <a
          href="${verificationURL}"
          style="display: inline-block; padding: 12px 24px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;"
        >
          Verify Email
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${verificationURL}">${verificationURL}</a></p>
    </div>
  `
}
