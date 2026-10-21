/**
 * Colored badge displaying a submission verdict.
 * Supports standard verdicts and detailed assessment test case counts.
 */
const STYLES = {
  ACCEPTED:              'bg-green-100  text-green-800  border-green-300',
  WRONG_ANSWER:          'bg-red-100    text-red-800    border-red-300',
  TIME_LIMIT_EXCEEDED:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  MEMORY_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800 border-orange-300',
  COMPILATION_ERROR:     'bg-purple-100 text-purple-800 border-purple-300',
  RUNTIME_ERROR:         'bg-pink-100   text-pink-800   border-pink-300',
  INTERNAL_ERROR:        'bg-slate-200  text-slate-800  border-slate-400',
  RUNNING:               'bg-blue-100   text-blue-800   border-blue-300 animate-pulse',
  PENDING:               'bg-gray-100   text-gray-500   border-gray-300 animate-pulse',
}

const LABELS = {
  ACCEPTED:              '✓ Accepted',
  WRONG_ANSWER:          '✗ Wrong Answer',
  TIME_LIMIT_EXCEEDED:   '⏱ TLE',
  MEMORY_LIMIT_EXCEEDED: '💾 MLE',
  COMPILATION_ERROR:     '⚠ Compile Error',
  RUNTIME_ERROR:         '💥 Runtime Error',
  INTERNAL_ERROR:        '🔧 Internal Judge Error',
  RUNNING:               '⚡ Judging...',
  PENDING:               '⏳ Pending...',
}

export default function VerdictBadge({ verdict }) {
  if (!verdict) {
    return (
      <span className="inline-block px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap bg-gray-100 text-gray-500 border-gray-300 animate-pulse">
        ⏳ Pending...
      </span>
    )
  }

  // Handle composite verdicts like "ACCEPTED (10/10 Testcases Passed)"
  let baseKey = verdict
  if (verdict.includes(' ')) {
    baseKey = verdict.split(' ')[0]
  }

  const style = STYLES[baseKey] ?? STYLES.PENDING
  const label = LABELS[verdict] ?? verdict

  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap ${style}`}>
      {label}
    </span>
  )
}
