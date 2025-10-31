'use client'

export default function ClearStoragePage() {
  const clearStorage = () => {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    
    alert('Storage cleared! Refreshing page...')
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full bg-dark-card p-6 rounded-lg border border-dark-border">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Clear Storage
        </h1>
        
        <div className="space-y-4">
          <p className="text-text-secondary text-center">
            This will clear all localStorage, sessionStorage, and cookies, 
            forcing the app to reload data from the database.
          </p>
          
          <button
            onClick={clearStorage}
            className="w-full py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear Storage & Reload
          </button>
          
          <a
            href="/"
            className="block w-full py-3 px-4 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    </main>
  )
}





