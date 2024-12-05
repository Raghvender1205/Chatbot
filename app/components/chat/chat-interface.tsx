'use client'

import { useState, useRef, useEffect } from 'react'
import { SendIcon, Loader2, Copy, Paperclip, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import Sidebar from '@/app/components/sidebar'
import { useChatContext } from '@/app/contexts/chat-context'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from "next-themes"

type Message = {
  role: 'user' | 'ai'
  content: string
  files?: File[]
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
  const [files, setFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addMessage, getMessages } = useChatContext()

  const messages = chatId ? getMessages(chatId) : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if ((!trimmedInput && files.length === 0) || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmedInput, files }
    addMessage(chatId!, userMessage)
    setInput('')
    setFiles([])
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('message', trimmedInput)
      formData.append('chatId', chatId || '')
      files.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove))
  }

  const renderMessage = (message: Message) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{message.content.slice(lastIndex, match.index)}</span>
        );
      }

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

    if (lastIndex < message.content.length) {
      parts.push(
        <span key={lastIndex}>{message.content.slice(lastIndex)}</span>
      );
    }

    if (message.files && message.files.length > 0) {
      parts.push(
        <div key="files" className="mt-2">
          <p className="text-sm font-semibold">Attachments:</p>
          <ul className="list-disc list-inside">
            {message.files.map((file, index) => (
              <li key={index} className="text-sm">{file.name}</li>
            ))}
          </ul>
        </div>
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
          <div className="flex flex-col space-y-2">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center bg-gray-200 rounded-full px-3 py-1">
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-5 w-5"
                      onClick={() => removeFile(file)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}