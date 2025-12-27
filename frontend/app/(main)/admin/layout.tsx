"use client"

import { AdminUsersProvider } from "@/contexts/admin-users-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminUsersProvider>
      {children}
    </AdminUsersProvider>
  )
}
