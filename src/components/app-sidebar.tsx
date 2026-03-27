"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Flame,
  Settings,
  ShieldCheck,
  FileJson,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const studentNavGroups = [
  {
    label: "Learn",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Daily Questions", url: "/questions", icon: BookOpen },
      { title: "My Progress", url: "/progress", icon: TrendingUp },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/settings/account", icon: Settings },
    ],
  },
]

const adminNavGroup = {
  label: "Admin",
  items: [
    { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
    { title: "Browse Questions", url: "/admin/questions", icon: BookOpen },
    { title: "Classes & Units", url: "/admin/units", icon: GraduationCap },
    { title: "Import Questions", url: "/admin/import", icon: FileJson },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_CLERK_ID

  const navGroups = isAdmin
    ? [...studentNavGroups, adminNavGroup]
    : studentNavGroups

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Atomic Solve</span>
                  <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    Build your streak
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
