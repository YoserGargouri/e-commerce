"use client"
import { AdminLayout } from "@/layouts/AdminLayout"
import { OrdersList } from "@/components/admin/OrdersList"

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrdersList />
    </AdminLayout>
  )
}

