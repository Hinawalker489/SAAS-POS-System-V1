"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
          <Input
            className="pl-10"
            placeholder="Search..."
            type="search"
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          <div className="flex items-center gap-x-2">
            <div className="hidden lg:flex lg:flex-col lg:items-end">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-5 text-gray-500">{user.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

