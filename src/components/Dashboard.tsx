'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Dog } from '@/lib/supabase'
import Link from 'next/link'

interface DogWithFeedings extends Dog {
  todays_feedings: number
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [dogs, setDogs] = useState<DogWithFeedings[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDogs = useCallback(async () => {
    try {
      // Get dogs for the current user
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .eq('user_id', user?.id)

      if (dogsError) throw dogsError

      // Get today's feedings count for each dog
      const today = new Date().toISOString().split('T')[0]
      const dogsWithFeedings = await Promise.all(
        dogsData.map(async (dog) => {
          const { count } = await supabase
            .from('feedings')
            .select('*', { count: 'exact', head: true })
            .eq('dog_id', dog.id)
            .gte('timestamp', `${today}T00:00:00.000Z`)
            .lt('timestamp', `${today}T23:59:59.999Z`)

          return {
            ...dog,
            todays_feedings: count || 0,
          }
        })
      )

      setDogs(dogsWithFeedings)
    } catch (error) {
      console.error('Error fetching dogs:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchDogs()
    }
  }, [user, fetchDogs])

  const handleFeedDog = async (dogId: string) => {
    try {
      const { error } = await supabase
        .from('feedings')
        .insert({
          dog_id: dogId,
          user_id: user?.id,
        })

      if (error) throw error

      // Refresh the dogs list
      fetchDogs()
    } catch (error) {
      console.error('Error feeding dog:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dog Feeding Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Dogs</h2>
            <Link
              href="/add-dog"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add New Dog
            </Link>
          </div>

          {dogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No dogs added yet.</p>
              <Link
                href="/add-dog"
                className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Your First Dog
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dogs.map((dog) => (
                <div key={dog.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {dog.photo_url ? (
                          <img
                            className="h-12 w-12 rounded-full"
                            src={dog.photo_url}
                            alt={dog.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-lg">
                              {dog.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{dog.name}</h3>
                        <p className="text-sm text-gray-500">
                          Fed {dog.todays_feedings} time{dog.todays_feedings !== 1 ? 's' : ''} today
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleFeedDog(dog.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Fed Now
                      </button>
                      <Link
                        href={`/dog/${dog.id}`}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                      >
                        View History
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
