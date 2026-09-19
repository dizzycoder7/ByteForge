import { Link } from 'react-router-dom'

const DIFFICULTY_STYLE = {
  EASY:   'text-green-700 bg-green-50 border-green-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  HARD:   'text-red-700 bg-red-50 border-red-200',
}

export default function ProblemCard({ problem, index }) {
  const targetSlug = problem.slug || problem.id

  return (
    <Link
      to={`/problems/${targetSlug}`}
      className="bg-white rounded-xl border border-gray-200/90 px-6 py-4 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-5 group cursor-pointer block text-left"
    >
      {/* Row number */}
      <span className="text-sm text-gray-400 w-8 flex-shrink-0 font-mono group-hover:text-blue-600 font-bold">
        {index + 1}
      </span>

      {/* Title + author */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {problem.title}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">by @{problem.authorUsername}</p>
      </div>

      {/* Difficulty badge */}
      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex-shrink-0 ${DIFFICULTY_STYLE[problem.difficulty]}`}>
        {problem.difficulty}
      </span>

      {/* Arrow indicator */}
      <span className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-sm">
        →
      </span>
    </Link>
  )
}
