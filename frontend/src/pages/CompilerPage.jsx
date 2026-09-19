import { useState } from 'react'
import { Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

const STARTER_CODE = {
  PYTHON: '# cook your dish here\nprint("Hello ByteForge!")\n',
  JAVA: `// cook your dish here
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Hello ByteForge!");
    }
}
`,
  CPP: `// cook your dish here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello ByteForge!" << endl;
    return 0;
}
`,
}

const MONACO_LANG = {
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
}

export default function CompilerPage() {
  const [language, setLanguage] = useState('PYTHON')
  const [code, setCode] = useState(STARTER_CODE.PYTHON)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const [status, setStatus] = useState(null)
  const [executionTime, setExecutionTime] = useState(null)
  const [running, setRunning] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value
    setLanguage(nextLang)
    setCode(STARTER_CODE[nextLang] || '')
    setOutput('')
    setErrorOutput('')
    setStatus(null)
  }

  const handleRun = async () => {
    setRunning(true)
    setStatus('RUNNING')
    setOutput('')
    setErrorOutput('')

    try {
      const { data } = await api.post('/compiler/run', {
        code,
        language,
        input,
      })

      setOutput(data.stdout || '')
      setErrorOutput(data.stderr || '')
      setStatus(data.status)
      setExecutionTime(data.executionTimeMs)
    } catch (err) {
      setStatus('ERROR')
      setErrorOutput(err.response?.data?.error || 'Failed to connect to compiler runner.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="bg-[#121824] min-h-screen font-sans text-gray-100 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP SUB-HEADER (Screenshot 1)                                   */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#181f2e] border-b border-gray-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Online Compiler
        </h1>

        <Link
          to="/problems"
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-[#1e293b] border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Check out our Practice section</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. MAIN SPLIT-SCREEN IDE INTERFACE (Screenshot 1)                  */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
          
          {/* Left Panel: Monaco Editor (7 cols) */}
          <div className="lg:col-span-7 bg-[#161c28] border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            {/* Editor Control Bar */}
            <div className="bg-[#1a2232] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-[#121824] border border-gray-700 text-gray-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="PYTHON">Python 3</option>
                  <option value="JAVA">Java 21 (Solution.java)</option>
                  <option value="CPP">C++ (g++ 20)</option>
                </select>
              </div>

              {/* Editor Font Size Settings */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button
                  onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                  className="px-2 py-0.5 bg-[#121824] border border-gray-700 rounded hover:text-white"
                  title="Decrease font"
                >
                  A-
                </button>
                <span className="font-mono text-[11px]">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                  className="px-2 py-0.5 bg-[#121824] border border-gray-700 rounded hover:text-white"
                  title="Increase font"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Monaco Code Editor */}
            <div className="flex-1 min-h-[480px]">
              <Editor
                height="100%"
                language={MONACO_LANG[language]}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize,
                  fontFamily: 'Fira Code, Cascadia Code, Consolas, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 4,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Right Panel: I/O Console (5 cols) */}
          <div className="lg:col-span-5 bg-[#161c28] border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-lg">
            
            {/* Top Bar: Run Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Interactive Console
              </span>

              <button
                onClick={handleRun}
                disabled={running}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-xs px-6 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {running ? (
                  <>
                    <span className="animate-spin text-sm">⚡</span>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Input Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400">
                Custom Input (stdin)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                placeholder="Enter Input here"
                className="w-full bg-[#10141e] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10.5px] text-gray-500 italic">
                If your code takes input, add it in the above box before running.
              </p>
            </div>

            {/* Output Box */}
            <div className="flex-1 flex flex-col space-y-1.5 min-h-[160px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-400">Output</span>
                {status && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      status === 'ACCEPTED' || status === 'SUCCESS'
                        ? 'bg-green-900/60 text-green-400'
                        : 'bg-red-900/60 text-red-400'
                    }`}
                  >
                    {status} {executionTime !== null && `(${executionTime}ms)`}
                  </span>
                )}
              </div>

              <div className="flex-1 bg-[#10141e] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 overflow-auto min-h-[140px] max-h-[220px]">
                {errorOutput ? (
                  <pre className="text-red-400 whitespace-pre-wrap">{errorOutput}</pre>
                ) : output ? (
                  <pre className="text-green-300 whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-gray-600 italic">
                    Output will appear here after clicking Run...
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. INFORMATIONAL SECTION BELOW COMPILER (Screenshots 2 & 3)        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-[#10151f] border-t border-gray-800/80 py-16 px-4 sm:px-6 lg:px-8 text-gray-300 text-xs">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Section 1: Online Compiler Overview */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Online Compiler</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Welcome to our online compiler, the perfect platform to run and test your code efficiently. Our tool makes coding easy for developers of any skill level, whether you&apos;re a beginner or experienced.
            </p>

            <div className="space-y-2 pt-2">
              <p className="font-semibold text-gray-200">Our compiler will allow you to</p>
              <ul className="space-y-1.5 text-gray-400 pl-4 list-disc marker:text-blue-500">
                <li>Run your code fast</li>
                <li>Get detailed output and error description after each run</li>
                <li>You can also check the time and memory usage of your code</li>
                <li>Write your code faster using the auto-complete feature</li>
                <li>Use and import libraries</li>
                <li>Customize the editor with your favorite theme</li>
                <li>Read / Write and edit files like csv, text etc</li>
              </ul>
            </div>
          </div>

          {/* Section 2: What is an online compiler? */}
          <div className="space-y-2.5 pt-4 border-t border-gray-800">
            <h3 className="text-base font-bold text-white">What is an online compiler?</h3>
            <p className="text-gray-400 leading-relaxed">
              Online compilers are online code editors that let you run and test your code in a web browser easily. Use our code editor above to write your code, and compile it.
            </p>
          </div>

          {/* Section 3: Check out our other online compilers */}
          <div className="space-y-2.5 pt-4 border-t border-gray-800">
            <h3 className="text-base font-bold text-white">Check out our other online compilers</h3>
            <ul className="space-y-1.5 text-blue-400 pl-4 list-disc">
              <li><button onClick={() => setLanguage('PYTHON')} className="hover:underline">Online Python compiler</button></li>
              <li><button onClick={() => setLanguage('CPP')} className="hover:underline">Online C++ compiler</button></li>
              <li><button onClick={() => setLanguage('JAVA')} className="hover:underline">Online Java compiler</button></li>
              <li><button onClick={() => setLanguage('CPP')} className="hover:underline">Online C compiler</button></li>
              <li><button onClick={() => setLanguage('PYTHON')} className="hover:underline">Online JavaScript compiler</button></li>
              <li><button onClick={() => setLanguage('PYTHON')} className="hover:underline">Online React compiler</button></li>
            </ul>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. FOOTER                                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CodeChefFooter />

    </div>
  )
}
