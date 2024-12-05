'use client'

import { useState, useRef, useEffect } from 'react'
import { SendIcon, Loader2, Copy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import Sidebar from '@/app/components/sidebar'
import { useChatContext } from '@/app/contexts/chat-context'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from "next-themes"
import { Textarea } from "@/app/components/ui/textarea"

type Message = {
  role: 'user' | 'ai'
  content: string
}

interface ChatInterfaceProps {
  chatId?: string
  onLogout: () => void
  token: string
}

export default function ChatInterface({ chatId, onLogout, token }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addMessage, getMessages } = useChatContext()

  const messages = chatId ? getMessages(chatId) : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmedInput }
    addMessage(chatId!, userMessage)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: trimmedInput, chatId }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const aiMessage: Message = { role: 'ai', content: data.response }
      addMessage(chatId!, aiMessage)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessage = (message: Message) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{message.content.slice(lastIndex, match.index)}</span>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <div key={match.index} className="relative">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ padding: '1em', borderRadius: '0.5em' }}
          >
            {code}
          </SyntaxHighlighter>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < message.content.length) {
      parts.push(
        <span key={lastIndex}>{message.content.slice(lastIndex)}</span>
      );
    }

    return parts;
  };

  const { theme } = useTheme()

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar>
                  <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                </Avatar>
                <div className={`p-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {renderMessage(message)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className="text-red-500 p-2">{error}</p>}
        <form onSubmit={handleSubmit} className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className={`flex-grow resize-none ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
              rows={1}
              style={{ minHeight: '2.5rem', maxHeight: '10rem' }}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}