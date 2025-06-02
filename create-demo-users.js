import bcrypt from 'bcryptjs';

async function createHashedPasswords() {
  const password = 'VadisAI@2025';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

createHashedPasswords();