'use client'

import { useParams } from 'next/navigation'
import ChatInterface from '@/app/components/chat/chat-interface'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatContext } from '@/app/contexts/chat-context'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    setIsLoading(false)
  }, [router, chatId, setCurrentChatId])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!token) {
    return null
  }

  return <ChatInterface chatId={chatId} onLogout={handleLogout} token={token} />
}