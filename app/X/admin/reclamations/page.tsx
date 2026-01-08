"use client"
import { AdminLayout } from "@/layouts/AdminLayout"
import { ReclamationsList } from "@/components/admin/ReclamationsList"

export default function AdminReclamationsPage() {
  return (
    <AdminLayout>
      <ReclamationsList />
    </AdminLayout>
  )
}
