import configPromise from '@payload-config'
import type { User } from '@/payload-types'
import { NextResponse } from 'next/server'
import { createLocalReq, generatePayloadCookie, getFieldsToSign, getPayload, jwtSign } from 'payload'

type VerifiableUser = User & {
  _verificationToken?: null | string
  _verified?: boolean
}

const addSessionToVerifiedUser = async ({
  payload,
  req,
  user,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  req: Awaited<ReturnType<typeof createLocalReq>>
  user: VerifiableUser
}) => {
  const collectionConfig = payload.collections.users.config
  let sid: string | undefined

  if (collectionConfig.auth.useSessions) {
    sid = crypto.randomUUID()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + collectionConfig.auth.tokenExpiration * 1000)
    const activeSessions = (user.sessions || []).filter(({ expiresAt: sessionExpiry }) => {
      const expiry = new Date(sessionExpiry)
      return expiry > now
    })

    user.sessions = [
      ...activeSessions,
      {
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        id: sid,
      },
    ]

    user.updatedAt = now.toISOString()

    await payload.db.updateOne({
      id: user.id,
      collection: 'users',
      data: user as unknown as Record<string, unknown>,
      req,
      returning: false,
    })
  }

  return { sid }
}

export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const requestURL = new URL(request.url)
  const token = requestURL.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('The verification link is missing its token.')}`,
        requestURL,
      ),
    )
  }

  const req = await createLocalReq({ req: { headers: request.headers, url: request.url } }, payload)

  const user = (await payload.db.findOne({
    collection: 'users',
    req,
    where: {
      _verificationToken: {
        equals: token,
      },
    },
  })) as VerifiableUser | null

  if (!user) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('This verification link is invalid or has already been used.')}`,
        requestURL,
      ),
    )
  }

  await payload.verifyEmail({
    collection: 'users',
    req,
    token,
  })

  user._verified = true
  user._verificationToken = null

  const collectionConfig = payload.collections.users.config
  const { sid } = await addSessionToVerifiedUser({
    payload,
    req,
    user,
  })
  const { token: authToken } = await jwtSign({
    fieldsToSign: getFieldsToSign({
      collectionConfig,
      email: user.email,
      sid,
      user,
    }),
    secret: payload.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })
  const cookie = generatePayloadCookie({
    collectionAuthConfig: collectionConfig.auth,
    cookiePrefix: payload.config.cookiePrefix,
    token: authToken,
  })

  const response = NextResponse.redirect(
    new URL(
      `/account?success=${encodeURIComponent('Your email has been verified and you are now logged in.')}`,
      requestURL,
    ),
  )

  response.headers.set('Set-Cookie', cookie)

  return response
}
