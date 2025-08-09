'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  text?: string
  href?: string
  className?: string
}

export default function BackButton({ 
  text = 'Back', 
  href,
  className = '' 
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`flex items-center gap-2 text-[#355E3B] hover:text-[#D4AF37] p-0 h-auto ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {text}
    </Button>
  )
}
