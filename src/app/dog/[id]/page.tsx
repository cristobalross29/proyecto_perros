import DogHistory from '@/components/DogHistory'

interface DogPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DogPage({ params }: DogPageProps) {
  const { id } = await params
  return <DogHistory dogId={id} />
}
