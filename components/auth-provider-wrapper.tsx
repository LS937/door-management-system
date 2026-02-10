"use client"

import { SimpleAuthProvider } from "@/lib/simple-auth"
import { ReactNode } from "react"

export function AuthProviderWrapper({ 
  children, 
  useSimpleAuth 
}: { 
  children: ReactNode
  useSimpleAuth: boolean
}) {
  if (useSimpleAuth) {
    return <SimpleAuthProvider>{children}</SimpleAuthProvider>
  }
  
  return <>{children}</>
}
