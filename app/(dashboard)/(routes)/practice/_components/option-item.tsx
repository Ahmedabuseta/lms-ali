'use client'

import { Check, X } from 'lucide-react'

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface OptionItemProps {
  option: Option
  isSelected: boolean
  isAnswered: boolean
  onClick: () => void
}

export const OptionItem = ({
  option,
  isSelected,
  isAnswered,
  onClick
}: OptionItemProps) => {
  const getBgColor = () => {
    if (!isAnswered) {
      return isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-slate-50'
    }
    
    if (option.isCorrect) {
      return 'bg-green-50 border-green-300'
    }
    
    if (isSelected && !option.isCorrect) {
      return 'bg-red-50 border-red-300'
    }
    
    return 'bg-white opacity-70'
  }
  
  const getIcon = () => {
    if (!isAnswered) {
      return null
    }
    
    if (option.isCorrect) {
      return <Check className="h-5 w-5 text-green-600" />
    }
    
    if (isSelected && !option.isCorrect) {
      return <X className="h-5 w-5 text-red-600" />
    }
    
    return null
  }
  
  return (
    <div
      className={`
        ${getBgColor()}
        border rounded-md p-3 flex items-center justify-between
        cursor-pointer transition-colors
        ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={!isAnswered ? onClick : undefined}
    >
      <span className="font-medium">{option.text}</span>
      {getIcon()}
    </div>
  )
}