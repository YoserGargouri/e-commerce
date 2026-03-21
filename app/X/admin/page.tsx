"use client"
import { AdminLayout } from "@/layouts/AdminLayout"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}

