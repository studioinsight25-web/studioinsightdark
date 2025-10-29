// scripts/generate-password-hash.ts - Generate password hash
import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 12)
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('')
  console.log('SQL command to update:')
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@studio-insight.nl';`)
}

generateHash()

