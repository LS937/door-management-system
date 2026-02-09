import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Door Management</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome to Door Management System
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete solution for handling wooden door orders efficiently
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
            <Button asChild size="lg" className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>

          <div className="pt-8 space-y-4 text-sm text-muted-foreground">
            <p className="font-semibold">Features:</p>
            <ul className="grid gap-2 text-left max-w-md mx-auto">
              <li>✓ Easy order placement and tracking</li>
              <li>✓ Real-time order status updates</li>
              <li>✓ Pickup request management</li>
              <li>✓ Admin dashboard for order processing</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 Door Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
