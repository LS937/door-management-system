"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SimpleUser {
  id: string
  firstName: string
  emailAddresses: { emailAddress: string }[]
}

interface SimpleAuthContextType {
  user: SimpleUser | null
  isLoaded: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string) => Promise<void>
  signOut: () => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('simple-auth-user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoaded(true)
  }, [])

  const signIn = async (email: string, password: string) => {
    // In a real app, this would call an API
    const users = JSON.parse(localStorage.getItem('simple-auth-users') || '[]')
    const foundUser = users.find((u: any) => u.email === email && u.password === password)
    
    if (foundUser) {
      const simpleUser: SimpleUser = {
        id: foundUser.id,
        firstName: foundUser.firstName,
        emailAddresses: [{ emailAddress: foundUser.email }]
      }
      setUser(simpleUser)
      localStorage.setItem('simple-auth-user', JSON.stringify(simpleUser))
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const signUp = async (email: string, password: string, firstName: string) => {
    // In a real app, this would call an API
    const users = JSON.parse(localStorage.getItem('simple-auth-users') || '[]')
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists')
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      firstName
    }
    
    users.push(newUser)
    localStorage.setItem('simple-auth-users', JSON.stringify(users))

    const simpleUser: SimpleUser = {
      id: newUser.id,
      firstName: newUser.firstName,
      emailAddresses: [{ emailAddress: newUser.email }]
    }
    
    setUser(simpleUser)
    localStorage.setItem('simple-auth-user', JSON.stringify(simpleUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('simple-auth-user')
  }

  return (
    <SimpleAuthContext.Provider value={{ user, isLoaded, signIn, signUp, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider')
  }
  return context
}
