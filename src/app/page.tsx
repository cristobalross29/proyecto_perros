'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'
import Dashboard from '@/components/Dashboard'
import AddDogForm from '@/components/AddDogForm'
import DogHistory from '@/components/DogHistory'

type View = 'dashboard' | 'add-dog' | 'dog-history'

export default function Home() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedDogId, setSelectedDogId] = useState<string>('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const handleViewHistory = (dogId: string) => {
    setSelectedDogId(dogId)
    setCurrentView('dog-history')
  }

  const handleAddDog = () => {
    setCurrentView('add-dog')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedDogId('')
  }

  switch (currentView) {
    case 'add-dog':
      return <AddDogForm onBack={handleBackToDashboard} />
    case 'dog-history':
      return <DogHistory dogId={selectedDogId} onBack={handleBackToDashboard} />
    default:
      return (
        <Dashboard 
          onViewHistory={handleViewHistory}
          onAddDog={handleAddDog}
        />
      )
  }
}
