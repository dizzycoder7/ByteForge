import { Link } from 'react-router-dom'

/**
 * Exact CodeChef Dark Footer from Screenshot 3:
 * - 'get coding faster' with developer sitting on floor with laptop & lightning sparks
 * - Deep navy-blue background (#0f1e38)
 * - Bengaluru address & contact details
 * - Roadmaps, Career Paths, Compilers, Company columns
 */
export default function CodeChefFooter() {
  return (
    <footer className="w-full bg-white pt-16">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. GET CODING FASTER MASCOT ILLUSTRATION (Screenshot 3)           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center pb-12 px-4 select-none">
        <h3 className="text-2xl font-black text-gray-300 tracking-tight lowercase mb-6">
          get coding faster
        </h3>

        {/* Developer sitting on floor with blue laptop and lightning sparks ⚡ */}
        <div className="relative inline-block">
          {/* Lightning sparks around shoulders */}
          <div className="absolute -top-3 left-3 text-amber-500 font-bold text-xl animate-pulse">
            ⚡
          </div>
          <div className="absolute -top-3 right-3 text-amber-500 font-bold text-xl animate-pulse">
            ⚡
          </div>

          {/* Coder Graphic */}
          <div className="text-6xl sm:text-7xl filter drop-shadow-sm">
            🧘‍♂️
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. DEEP NAVY BLUE FOOTER WITH ALL 4 COLUMNS (Screenshot 3)        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f1e38] text-white pt-16 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 text-xs">
          
          {/* Left Column: Brand & Bengaluru Office Details (4 cols) */}
          <div className="md:col-span-4 space-y-4 text-gray-300">
            <div className="text-2xl font-black tracking-wider text-[#6ea8fe]">
              BYTEFORGE
            </div>

            <p className="leading-relaxed text-[12px] text-gray-300 max-w-xs">
              Bizzhub Workspaces, 6th Floor,<br />
              MSR North Tower, Outer Ring Rd,<br />
              Manayata Tech Park, Nagavara,<br />
              Bengaluru, Karnataka 560045
            </p>

            <div className="space-y-1 text-[12px] pt-1">
              <p>
                <a href="mailto:help@byteforge.tech" className="hover:text-blue-400 text-gray-300">
                  help@byteforge.tech
                </a>
              </p>
              <p className="text-gray-300">+91 95911 47880</p>
            </div>

            {/* Social Icons Row */}
            <div className="pt-3">
              <p className="text-[10px] text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                Find us online
              </p>
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs">▶</span>
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold">𝕏</span>
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold">in</span>
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold">f</span>
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs">📷</span>
                <span className="h-7 w-7 rounded bg-[#1e2f4f] hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold">M</span>
              </div>
            </div>
          </div>

          {/* Right Columns: 4 Sections (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-[12px]">
            
            {/* 1. ROADMAPS */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
                ROADMAPS
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/problems" className="hover:text-blue-400">Learn Python</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Learn Java</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Learn C</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Learn C++</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Data structures and Algorithms</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Competitive Programming</Link></li>
                <li><Link to="/problems" className="text-blue-400 hover:underline">More Roadmaps</Link></li>
              </ul>
            </div>

            {/* 2. CAREER PATHS */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
                CAREER PATHS
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/problems" className="hover:text-blue-400">React JS Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Full stack Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">SQL for Data Analysis</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Frontend Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Java Backend Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Data Analysis using Python</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Python Backend Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">C++ Developer</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Machine Learning using Python</Link></li>
              </ul>
            </div>

            {/* 3. COMPILERS */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
                COMPILERS
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/problems" className="hover:text-blue-400">HTML online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">C++ online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">C online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Java online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Python online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">SQL online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">JavaScript online compiler</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">React online compiler</Link></li>
                <li><Link to="/problems" className="text-blue-400 hover:underline">More compilers</Link></li>
              </ul>
            </div>

            {/* 4. COMPANY */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
                COMPANY
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/problems" className="hover:text-blue-400">About us</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">For colleges</Link></li>
                <li><Link to="/leaderboard" className="hover:text-blue-400">Coding Contests</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Blogs</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Hire from us</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Contact us</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/problems" className="hover:text-blue-400">Frequently Asked Questions</Link></li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </footer>
  )
}
