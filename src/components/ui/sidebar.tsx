'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "./button"

export type SidebarItem = {
  label: string
  mobileLabel?: string
  href: string
  icon?: React.ReactNode
}

export type SidebarSection = {
  title?: string
  items: SidebarItem[]
}

type SidebarProps = {
  sections?: SidebarSection[]
  items?: SidebarItem[]
  type: "sidebar" | "footer"
  user: {
    name: string
    role: string
  },
  onLogout: () => void
  logoSrc?: string
  onItemClick?: () => void
}

export function Sidebar({ items, sections, type, user, onLogout, logoSrc, onItemClick }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    onLogout()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'vendedor': 'Vendedor'
    }
    return roles[role] || role
  }

  // Renderizar item individual
  const renderItem = (item: SidebarItem, index: number) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

    return (
      <li key={`${item.href}-${index}`}>
        <Link
          href={item.href}
          onClick={onItemClick}
          className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 group
                        ${isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground'
            }
                    `}
        >
          <div className={`
                        text-xl transition-transform duration-200
                        ${isActive ? '' : 'group-hover:scale-110'}
                    `}>
            {item.icon}
          </div>
          <span className="text-sm font-medium">
            {item.label}
          </span>
        </Link>
      </li>
    )
  }

  return (
    <div className="w-full h-full">
      {
        type === "sidebar" ? (
          <div className="flex flex-col h-full bg-background border-r border-border">
            {/* Logo Section */}
            <div className="p-3 border-b border-border">
              <Link href="/" className="flex items-center justify-center">
                <Image
                  src={logoSrc || "/logo.svg"}
                  alt="Aura Health"
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div')
                      fallback.className = 'logo-fallback text-center'
                      fallback.innerHTML = `
                                                    <div class="text-2xl font-bold text-primary">
                                                        SOLO
                                                    </div>
                                                `
                      parent.appendChild(fallback)
                    }
                  }}
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {sections ? (
                <div className="space-y-6">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      {section.title && (
                        <h3 className="px-4 mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                      )}
                      <ul className="flex flex-col gap-2">
                        {section.items.map((item, itemIndex) => renderItem(item, itemIndex))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {items?.map((item, index) => renderItem(item, index))}
                </ul>
              )}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-border bg-background">
              {user && (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center font-semibold text-sm">
                      {getInitials(user.name || 'User')}
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* {getRoleName(user.role)} */}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border py-2">
            <ul className="flex flex-row w-full justify-around items-center max-w-2xl mx-auto px-2">
              {/* Flatten sections into items for footer mode */}
              {(items || sections?.flatMap(s => s.items) || []).map((item, index) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                return (
                  <li key={`${item.href}-${index}`} className="flex-1 relative">
                    <Link
                      href={item.href}
                      onClick={onItemClick}
                      className={`
                        flex flex-col items-center justify-center gap-1 py-2 px-2
                        transition-all duration-200 rounded-lg
                        ${isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <div className={`
                        h-5 w-5 transition-all duration-200
                        ${isActive ? 'scale-110' : ''}
                      `}>
                        {item.icon}
                      </div>
                      <p className={`
                        text-[10px] font-medium text-center
                        ${isActive ? 'text-primary' : 'text-muted-foreground'}
                      `}>
                        {item.mobileLabel ?? item.label}
                      </p>
                    </Link>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-t-full" />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }
    </div>
  )
}