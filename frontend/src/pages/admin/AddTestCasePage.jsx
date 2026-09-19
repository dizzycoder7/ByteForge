import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function AddTestCasePage() {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    inputData: '',
    expectedOutput: '',
    sample: true,
    orderIndex: 0,
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [probRes, tcRes] = await Promise.all([
        api.get(`/problems/${id}`),
        api.get(`/problems/${id}/testcases`),
      ])
      setProblem(probRes.data)
      setTestCases(tcRes.data)
      setForm((prev) => ({ ...prev, orderIndex: tcRes.data.length }))
    } catch (err) {
      setError('Failed to load problem or test cases.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAddTestCase = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await api.post(`/problems/${id}/testcases`, {
        ...form,
        orderIndex: parseInt(form.orderIndex, 10),
      })
      setSuccess('Test case added successfully!')
      setForm({
        inputData: '',
        expectedOutput: '',
        sample: false,
        orderIndex: testCases.length + 1,
      })
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add test case.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTestCase = async (tcId) => {
    if (!window.confirm('Delete this test case?')) return
    try {
      await api.delete(`/problems/${id}/testcases/${tcId}`)
      await loadData()
    } catch (err) {
      alert('Failed to delete test case.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/problems" className="text-xs text-indigo-600 hover:underline">
            ← Back to Problems
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Manage Test Cases
          </h1>
          <p className="text-sm text-gray-500">
            Problem: <span className="font-semibold text-gray-700">{problem?.title}</span> (ID: {id})
          </p>
        </div>

        {problem?.slug && (
          <Link
            to={`/problems/${problem.slug}`}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            View Problem Page →
          </Link>
        )}
      </div>

      {/* Existing Test Cases List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Existing Test Cases ({testCases.length})
        </h2>

        {testCases.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No test cases yet. Add at least 1 sample and 1 hidden test case.
          </p>
        ) : (
          <div className="space-y-4">
            {testCases.map((tc, idx) => (
              <div
                key={tc.id}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">
                      #{idx + 1} (Order: {tc.orderIndex})
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        tc.sample
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tc.sample ? 'Sample (Public)' : 'Hidden (Judge Only)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Input:</p>
                      <pre className="bg-white p-2 rounded border border-gray-200 font-mono text-gray-800 overflow-x-auto max-h-24">
                        {tc.inputData}
                      </pre>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Expected Output:</p>
                      <pre className="bg-white p-2 rounded border border-gray-200 font-mono text-gray-800 overflow-x-auto max-h-24">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTestCase(tc.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Test Case Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Add New Test Case
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleAddTestCase} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Input Data <span className="text-red-500">*</span>
              </label>
              <textarea
                name="inputData"
                value={form.inputData}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Exact stdin data fed to the program"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expected Output <span className="text-red-500">*</span>
              </label>
              <textarea
                name="expectedOutput"
                value={form.expectedOutput}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Exact stdout expected from the program"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sample"
                name="sample"
                checked={form.sample}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="sample" className="text-xs font-medium text-gray-700 cursor-pointer">
                Is Sample Test Case (visible on problem page)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">
                Order Index:
              </label>
              <input
                type="number"
                name="orderIndex"
                value={form.orderIndex}
                onChange={handleChange}
                min={0}
                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors"
            >
              {submitting ? 'Adding...' : '+ Add Test Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
