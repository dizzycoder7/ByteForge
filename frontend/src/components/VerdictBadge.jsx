/**
 * Colored badge displaying a submission verdict.
 * Each verdict maps to a distinct color so users can scan a list quickly.
 *
 * PENDING has an animate-pulse so users notice it's still in progress.
 */
const STYLES = {
  ACCEPTED:              'bg-green-100  text-green-800  border-green-300',
  WRONG_ANSWER:          'bg-red-100    text-red-800    border-red-300',
  TIME_LIMIT_EXCEEDED:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  MEMORY_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800 border-orange-300',
  COMPILATION_ERROR:     'bg-purple-100 text-purple-800 border-purple-300',
  RUNTIME_ERROR:         'bg-pink-100   text-pink-800   border-pink-300',
  PENDING:               'bg-gray-100   text-gray-500   border-gray-300 animate-pulse',
}

const LABELS = {
  ACCEPTED:              '✓ Accepted',
  WRONG_ANSWER:          '✗ Wrong Answer',
  TIME_LIMIT_EXCEEDED:   '⏱ TLE',
  MEMORY_LIMIT_EXCEEDED: '💾 MLE',
  COMPILATION_ERROR:     '⚠ Compile Error',
  RUNTIME_ERROR:         '💥 Runtime Error',
  PENDING:               '⏳ Pending...',
}

export default function VerdictBadge({ verdict }) {
  const style = STYLES[verdict] ?? STYLES.PENDING
  const label = LABELS[verdict] ?? verdict

  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap ${style}`}>
      {label}
    </span>
  )
}
