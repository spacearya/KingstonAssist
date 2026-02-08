import { Leaf } from 'lucide-react'

/**
 * CertificationLeaves component displays leaf icons based on Green Plate Certification level
 * Gold = 3 leaves, Silver = 2 leaves, Bronze = 1 leaf
 */
export default function CertificationLeaves({ certification, size = 'w-4 h-4', className = '' }) {
  if (!certification || certification === 'null' || certification.toLowerCase() === 'null') {
    return null
  }

  const certLower = certification.toLowerCase().trim()
  let leafCount = 0

  if (certLower === 'gold') {
    leafCount = 3
  } else if (certLower === 'silver') {
    leafCount = 2
  } else if (certLower === 'bronze') {
    leafCount = 1
  }

  if (leafCount === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: leafCount }).map((_, index) => (
        <Leaf
          key={index}
          className={`${size} text-sage fill-sage`}
          aria-label={`${certification} certification`}
        />
      ))}
    </div>
  )
}

