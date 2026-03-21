"use client"
import { AdminLayout } from "@/layouts/AdminLayout"
import { ProductsManagement } from "@/components/admin/ProductsManagement"

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <ProductsManagement />
    </AdminLayout>
  )
}

