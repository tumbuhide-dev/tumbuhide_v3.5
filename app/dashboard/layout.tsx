import type React from "react"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <DashboardFooter />
    </div>
  )
}
