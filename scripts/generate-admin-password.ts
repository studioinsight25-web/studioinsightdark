// scripts/generate-admin-password.ts - Generate correct admin password hash
import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'admin123'
  
  // Generate hash with bcrypt
  const hash = await bcrypt.hash(password, 12)
  
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('')
  console.log('SQL command to update:')
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@studio-insight.nl';`)
  console.log('')
  console.log('Verify hash:')
  const isValid = await bcrypt.compare(password, hash)
  console.log('Is valid:', isValid)
}

generateHash()

