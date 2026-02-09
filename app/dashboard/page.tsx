"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Shield } from "lucide-react"
import { getUserRole, setUserRole } from "@/lib/storage"
import { useSimpleAuth } from "@/lib/simple-auth"

export default function DashboardPage() {
  const { user } = useSimpleAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/sign-in')
      return
    }

    if (mounted && user) {
      const role = getUserRole(user.id)
      if (role) {
        // User already has a role, redirect to their dashboard
        router.push(`/dashboard/${role}`)
      }
    }
  }, [user, router, mounted])

  const handleRoleSelection = (role: 'customer' | 'admin') => {
    if (user) {
      setUserRole(user.id, role)
      router.push(`/dashboard/${role}`)
    }
  }

  if (!mounted || !user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome, {user?.firstName || 'User'}!</h1>
          <p className="text-muted-foreground text-lg">
            Please select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection('customer')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Customer</CardTitle>
                  <CardDescription>Place and manage orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">As a customer, you can:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Place new door orders</li>
                <li>• Track order status</li>
                <li>• Request pickup for prepared orders</li>
                <li>• View order history</li>
              </ul>
              <Button className="w-full mt-4" onClick={() => handleRoleSelection('customer')}>
                Continue as Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection('admin')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Admin</CardTitle>
                  <CardDescription>Manage all orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">As an admin, you can:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Review and accept/reject orders</li>
                <li>• Manage order processing</li>
                <li>• Mark orders as prepared</li>
                <li>• Mark orders as delivered</li>
              </ul>
              <Button className="w-full mt-4" variant="destructive" onClick={() => handleRoleSelection('admin')}>
                Continue as Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
