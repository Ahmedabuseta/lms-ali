'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  icon: any
  label: string
  href: string
  tourId?: string
}

export const SidebarItem = ({ icon: Icon, label, href, tourId }: SidebarItemProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (pathname === '/' && href === '/') || pathname === href || pathname.startsWith(`${href}/`)

  const onClick = () => {
    router.push(href)
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'flex items-center gap-x-2 pl-6 text-sm font-[500] text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/20 dark:text-primary-foreground'
      )}
      data-tour={tourId}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon size={22} className={cn('text-muted-foreground', isActive && 'text-primary dark:text-primary-foreground')} />
        {label}
      </div>
      <div
        className={cn('ml-auto h-full border-2 border-primary opacity-0 transition-all', isActive && 'opacity-100')}
      />
    </button>
  )
}
