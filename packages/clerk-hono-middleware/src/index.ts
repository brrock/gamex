import { type ClerkClient, type ClerkOptions, createClerkClient } from '@clerk/backend'
import type { Context, MiddlewareHandler } from 'hono'

type ClerkAuth = ReturnType<Awaited<ReturnType<ClerkClient['authenticateRequest']>>['toAuth']>

declare module 'hono' {
  interface ContextVariableMap {
    clerk: ClerkClient
    clerkAuth: ClerkAuth
  }
}

export const getAuth = (c: Context) => {
  return c.get('clerkAuth')
}

export const clerkMiddleware = (
  secretKey: string,
  publishableKey: string,
  options?: Omit<ClerkOptions, 'secretKey' | 'publishableKey'>
): MiddlewareHandler => {
  return async (c, next) => {
    if (!secretKey) {
      throw new Error('Missing Clerk Secret key')
    }

    if (!publishableKey) {
      throw new Error('Missing Clerk Publishable key')
    }

    const clerkClient = createClerkClient({
      ...options,
      secretKey,
      publishableKey,
    })

    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      ...options,
      secretKey,
      publishableKey,
    })

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => c.res.headers.append(key, value))

      const locationHeader = requestState.headers.get('location')

      if (locationHeader) {
        return c.redirect(locationHeader, 307)
      } else if (requestState.status === 'handshake') {
        throw new Error('Clerk: unexpected handshake without redirect')
      }
    }

    c.set('clerkAuth', requestState.toAuth())
    c.set('clerk', clerkClient)

    await next()
  }
}