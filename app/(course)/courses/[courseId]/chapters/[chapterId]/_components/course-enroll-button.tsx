'use client'

import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CourseEnrollButtonProps {
  courseId: string
  price?: number
}

export const CourseEnrollButton = ({
  courseId,
  price
}: CourseEnrollButtonProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      const response = await axios.post(`/api/courses/${courseId}/checkout`)

      window.location.assign(response.data.url)
    } catch {
      toast.error('حدث خطأ ما')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className={cn(
        "w-full md:w-auto relative",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري التحميل...
        </>
      ) : (
        <>
          {price ? `اشترك الآن (${price} جنيه)` : 'اشترك مجاناً'}
        </>
      )}
    </Button>
  )
}
