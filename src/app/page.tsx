import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-slate-100 mb-4">
            Studio Insight
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Het platform voor ondernemers, podcasters en contentmakers
          </p>
          <div className="space-x-4">
            <button className="btn-primary">
              Ontdek Cursussen
            </button>
            <button className="btn-secondary">
              Bekijk E-books
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
