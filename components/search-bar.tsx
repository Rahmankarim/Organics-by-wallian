'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export default function SearchBar({ 
  className = '',
  placeholder = "Search premium dry fruits..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('')
      setIsExpanded(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            className="pl-10 pr-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Search suggestions could be added here */}
      {isExpanded && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#355E3B]/20 rounded-md shadow-lg mt-1 z-50">
          <div className="p-2 text-sm text-gray-600">
            Press Enter to search for "{query}"
          </div>
        </div>
      )}
    </div>
  )
}
