"use client"
import React, { ReactNode } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import type { Page } from "@/types"

interface UserLayoutProps {
  children: ReactNode
  currentPage?: Page
  onNavigate?: (page: Page) => void
  cartItemsCount?: number
}

export function UserLayout({
  children,
  currentPage = "home",
  onNavigate = () => {},
  cartItemsCount = 0,
}: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        cartItemsCount={cartItemsCount}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

