'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Dog, Feeding } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface FeedingWithDate extends Feeding {
  date: string
}

export default function DogHistory({ dogId }: { dogId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [dog, setDog] = useState<Dog | null>(null)
  const [feedings, setFeedings] = useState<FeedingWithDate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDogAndFeedings = useCallback(async () => {
    try {
      // Get dog details
      const { data: dogData, error: dogError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .eq('user_id', user?.id)
        .single()

      if (dogError) throw dogError
      setDog(dogData)

      // Get feedings
      const { data: feedingsData, error: feedingsError } = await supabase
        .from('feedings')
        .select('*')
        .eq('dog_id', dogId)
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })

      if (feedingsError) throw feedingsError

      // Group feedings by date
      const feedingsWithDate = feedingsData.map((feeding) => ({
        ...feeding,
        date: new Date(feeding.timestamp).toLocaleDateString(),
      }))

      setFeedings(feedingsWithDate)
    } catch (error) {
      console.error('Error fetching dog and feedings:', error)
    } finally {
      setLoading(false)
    }
  }, [dogId, user?.id])

  useEffect(() => {
    if (user && dogId) {
      fetchDogAndFeedings()
    }
  }, [user, dogId, fetchDogAndFeedings])

  const groupFeedingsByDate = () => {
    const grouped: { [key: string]: FeedingWithDate[] } = {}
    feedings.forEach((feeding) => {
      if (!grouped[feeding.date]) {
        grouped[feeding.date] = []
      }
      grouped[feeding.date].push(feeding)
    })
    return grouped
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Dog not found</div>
      </div>
    )
  }

  const groupedFeedings = groupFeedingsByDate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Feeding History - {dog.name}
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                {dog.photo_url ? (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={dog.photo_url}
                    alt={dog.name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-2xl">
                      {dog.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">{dog.name}</h2>
                  <p className="text-gray-500">
                    Added on {new Date(dog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {Object.keys(groupedFeedings).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No feeding records yet.</p>
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Go Back to Feed {dog.name}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedFeedings)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, dayFeedings]) => (
                      <div key={date} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {date} ({dayFeedings.length} feeding{dayFeedings.length !== 1 ? 's' : ''})
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {dayFeedings.map((feeding) => (
                            <div
                              key={feeding.id}
                              className="bg-gray-50 rounded-md p-3 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  {formatTime(feeding.timestamp)}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  #{feeding.id.slice(-4)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
