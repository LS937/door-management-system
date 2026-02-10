"use client"

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // In development without real Clerk keys, just render children
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_demo') {
    return <>{children}</>
  }

  return <BaseClerkProvider>{children}</BaseClerkProvider>
}
