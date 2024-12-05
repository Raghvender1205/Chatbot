'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/app/components/login-form'
import SignupForm from '@/app/components/signup-form'
import ChatInterface from '@/app/components/chat/chat-interface'

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const handleAuth = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        {isSignup ? (
          <SignupForm onSignup={handleAuth} onSwitchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm onLogin={handleAuth} onSwitchToSignup={() => setIsSignup(true)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ChatInterface onLogout={handleLogout} token={token} />
    </div>
  )
}