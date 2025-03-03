import * as bcrypt from 'bcrypt';

async function generateHash() {
  // Let's use a secure default password: "sugria@admin2024"
  const password = 'sugria@admin2024';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Admin password:', password);
  console.log('Password hash:', hash);
}

generateHash(); 