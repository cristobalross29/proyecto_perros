'use client'

import { useParams } from 'next/navigation'
import DogHistory from '@/components/DogHistory'

export default function DogPage() {
  const params = useParams()
  const id = params.id as string
  
  return <DogHistory dogId={id} />
}
