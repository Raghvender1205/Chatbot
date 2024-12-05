'use client'

import { useParams } from 'next/navigation'
import ChatInterface from '@/app/components/chat/chat-interface'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatContext } from '@/app/contexts/chat-context'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const { setCurrentChatId } = useChatContext()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setCurrentChatId(chatId)
    } else {
      router.push('/')
    }
  }, [router, chatId, setCurrentChatId])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!token) {
    return null // or a loading spinner
  }

  return <ChatInterface chatId={chatId} onLogout={handleLogout} token={token} />
}
