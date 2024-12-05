'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, User, LogOut, PlusCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { useChatContext } from '../contexts/chat-context'

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { chatHistory, addChat } = useChatContext()
  const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', email: '', role: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [])

  return (
    <div className="w-64 bg-white h-full flex flex-col border-r">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-indigo-600">Chatbot</h1>
      </div>
      <div className="px-4 mb-4">
        <Button onClick={addChat} className="w-full flex items-center justify-center">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-2">
          {chatHistory.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/chat/${chat.id}`}
                className={`flex items-center space-x-3 p-2 rounded-lg ${
                  pathname === `/chat/${chat.id}`
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="truncate">{chat.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4">
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              {userProfile.firstName} {userProfile.lastName}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <p className="text-sm font-medium">{userProfile.firstName} {userProfile.lastName}</p>
              <p className="text-xs text-gray-500">{userProfile.email}</p>
              <p className="text-xs text-gray-500">{userProfile.role}</p>
              <Link href="/settings" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}