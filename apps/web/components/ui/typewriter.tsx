'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenWords?: number
  className?: string
}

export function Typewriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
  className = '',
}: TypewriterProps) {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const currentWord = words[wordIndex]

    if (isDeleting) {
      if (text === '') {
        timeout = setTimeout(() => {
          setIsDeleting(false)
          setWordIndex(prev => (prev + 1) % words.length)
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1))
        }, deletingSpeed)
      }
    } else {
      if (text === currentWord) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, delayBetweenWords)
      } else {
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1))
        }, typingSpeed)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords])

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse border-r-2 border-current ml-1"></span>
    </span>
  )
}
