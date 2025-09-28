import DogHistory from '@/components/DogHistory'

interface DogPageProps {
  params: {
    id: string
  }
}

export default function DogPage({ params }: DogPageProps) {
  return <DogHistory dogId={params.id} />
}
