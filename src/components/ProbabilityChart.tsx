import type { CategoryProbability } from '../types'
import ConfidenceBar from './ConfidenceBar'

interface Props {
  probabilities: CategoryProbability[]
  topCategory: string
}

export default function ProbabilityChart({ probabilities, topCategory }: Props) {
  const top5 = probabilities.slice(0, 5)

  return (
    <div className="space-y-4">
      {top5.map(({ category, probability }, i) => (
        <ConfidenceBar
          key={category}
          category={category}
          value={probability}
          isTop={category === topCategory}
          delay={i * 80}
        />
      ))}
    </div>
  )
}
