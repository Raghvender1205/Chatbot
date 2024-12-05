'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'ai'
  content: string
}

type Chat = {
  id: string
  title: string
  messages: Message[]
}

type ChatContextType = {
  chatHistory: Chat[]
  addChat: () => void
  currentChatId: string | null
  setCurrentChatId: (id: string | null) => void
  addMessage: (chatId: string, message: Message) => void
  getMessages: (chatId: string) => Message[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const router = useRouter()

  const addChat = () => {
    const newChatId = uuidv4()
    const newChat = { id: newChatId, title: 'New Chat', messages: [] }
    setChatHistory((prevHistory) => [...prevHistory, newChat])
    setCurrentChatId(newChatId)
    router.push(`/chat/${newChatId}`)
  }

  const addMessage = (chatId: string, message: Message) => {
    setChatHistory((prevHistory) =>
      prevHistory.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    )
  }

  const getMessages = (chatId: string) => {
    const chat = chatHistory.find((chat) => chat.id === chatId)
    return chat ? chat.messages : []
  }

  return (
    <ChatContext.Provider value={{ chatHistory, addChat, currentChatId, setCurrentChatId, addMessage, getMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
