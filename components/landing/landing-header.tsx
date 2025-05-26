"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { BRAND, FEATURES } from "@/lib/constants"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Fitur", href: "/#features" },
    { name: "Harga", href: "/#pricing" },
    { name: "Demo", href: "/demo" },
    { name: "Tentang", href: "/about" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{BRAND.APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
            {loading ? (
              <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : user ? (
              <Button asChild>
                <Link href="/dashboard">Kembali ke Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                {FEATURES.REGISTRATION ? (
                  <Button asChild>
                    <Link href="/auth/register">Daftar Gratis</Link>
                  </Button>
                ) : (
                  <Button disabled>Segera Hadir</Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <Button asChild className="w-full">
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          Kembali ke Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Masuk
                          </Link>
                        </Button>
                        {FEATURES.REGISTRATION ? (
                          <Button asChild className="w-full">
                            <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                              Daftar Gratis
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled className="w-full">
                            Segera Hadir
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
