export default function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-emerald-500">
              Studio Insight
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-200 hover:text-emerald-400 transition-colors duration-200">
              Home
            </a>
            <a href="#" className="text-slate-200 hover:text-emerald-400 transition-colors duration-200">
              Cursussen
            </a>
            <a href="#" className="text-slate-200 hover:text-emerald-400 transition-colors duration-200">
              E-books
            </a>
            <a href="#" className="text-slate-200 hover:text-emerald-400 transition-colors duration-200">
              Reviews
            </a>
            <a href="#" className="text-slate-200 hover:text-emerald-400 transition-colors duration-200">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
