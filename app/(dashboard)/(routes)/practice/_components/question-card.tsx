'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, FileQuestion } from 'lucide-react'
import { OptionItem } from './option-item'

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  options: {
    id: string
    text: string
    isCorrect: boolean
  }[]
  difficulty?: string
}

interface QuestionCardProps {
  question: Question
  onNext: () => void
  onPrevious: () => void
  isFirstQuestion: boolean
  isLastQuestion: boolean
}

export const QuestionCard = ({
  question,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion
}: QuestionCardProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  
  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return
    
    setSelectedOptionId(optionId)
    const option = question.options.find(o => o.id === optionId)
    
    if (option) {
      setIsCorrect(option.isCorrect)
      setIsAnswered(true)
    }
  }
  
  const handleNext = () => {
    setSelectedOptionId(null)
    setIsAnswered(false)
    setIsCorrect(false)
    onNext()
  }
  
  const handlePrevious = () => {
    setSelectedOptionId(null)
    setIsAnswered(false)
    setIsCorrect(false)
    onPrevious()
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Question
          </CardTitle>
          {question.difficulty && (
            <Badge variant={
              question.difficulty === 'EASY' ? 'success' :
              question.difficulty === 'MEDIUM' ? 'warning' : 'destructive'
            }>
              {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <Separator className="mb-4" />
      
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          {question.text}
        </div>
        
        <div className="space-y-2">
          {question.options.map((option) => (
            <OptionItem
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              isAnswered={isAnswered}
              onClick={() => handleSelectOption(option.id)}
            />
          ))}
        </div>
        
        {isAnswered && (
          <div className={`p-4 rounded-md ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </p>
            <p className="text-sm mt-1">
              {isCorrect
                ? 'Great job! You selected the right answer.'
                : 'The correct answer is: ' + 
                  question.options.find(o => o.isCorrect)?.text}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={isFirstQuestion}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}