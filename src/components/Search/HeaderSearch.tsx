'use client'

import React from 'react'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'

export function HeaderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const searchValue = searchParams.get('q') || ''

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isOpen])

  React.useEffect(() => {
    if (searchValue) {
      setIsOpen(true)
    }
  }, [searchValue])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const input = form.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (input.value.trim()) {
      newParams.set('q', input.value.trim())
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/shop', newParams))
  }

  function closeIfEmpty() {
    if (!inputRef.current?.value.trim() && !searchValue) {
      setIsOpen(false)
    }
  }

  return (
    <form
      className={cn(
        'flex h-9 items-center overflow-hidden rounded-md border border-transparent bg-transparent transition-all duration-200 focus-within:outline-none focus-within:ring-0',
        isOpen
          ? 'w-[min(16rem,calc(100vw-8.5rem))] bg-background/78 px-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/62 dark:border-white/15 dark:bg-black/35 dark:supports-[backdrop-filter]:bg-black/25'
          : 'w-9',
      )}
      onSubmit={onSubmit}
    >
      <button
        aria-label="Search products"
        className="flex size-9 shrink-0 items-center justify-center text-foreground/75 transition hover:text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 border-0"
        onClick={() => setIsOpen(true)}
        type={isOpen ? 'submit' : 'button'}
      >
        <SearchIcon className="size-4" />
      </button>

      <input
        ref={inputRef}
        autoComplete="off"
        className={cn(
          'min-w-0 appearance-none !border-0 bg-transparent text-sm text-foreground !shadow-none placeholder:text-muted-foreground !outline-none !ring-0 focus:!border-0 focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0',
          isOpen ? 'ml-1 w-full opacity-100' : 'w-0 opacity-0',
        )}
        defaultValue={searchValue}
        key={searchValue}
        name="search"
        onBlur={closeIfEmpty}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setIsOpen(false)
          }
        }}
        placeholder="Search products..."
        style={{ border: 'none', boxShadow: 'none', outline: 'none', WebkitAppearance: 'none' }}
        type="text"
      />
    </form>
  )
}
