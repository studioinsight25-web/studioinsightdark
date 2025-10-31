// Script to clear localStorage and force reload from database
console.log('🧹 Clearing localStorage and forcing database reload...')

// Clear all localStorage data
localStorage.clear()

// Clear sessionStorage too
sessionStorage.clear()

// Clear any cookies related to products
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ localStorage, sessionStorage, and cookies cleared!')
console.log('🔄 Please refresh the page to load products from database')

// Force reload
window.location.reload()





