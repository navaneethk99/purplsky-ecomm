import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/cn'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  className?: string
}

export const StartShoppingButton: React.FC<Props> = ({ className }) => {
  return (
    <Button
      asChild
      size="sm"
      className={cn(
        'group rounded-full border border-white/30 bg-white/10 px-4 text-sm font-medium text-white shadow-none backdrop-blur-sm transition-colors duration-200 hover:border-white/50 hover:bg-white/16 focus-visible:ring-white/40',
        className,
      )}
    >
      <Link
        href="/shop"
        className="relative flex items-center justify-center gap-2 overflow-hidden rounded-full"
      >
        <span className="relative">Start Shopping</span>
        <ArrowRightIcon className="relative size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </Button>
  )
}
