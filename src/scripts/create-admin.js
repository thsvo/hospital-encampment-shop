require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    rl.question('Enter Admin Email: ', (email) => {
      rl.question('Enter Admin Password: ', async (password) => {
        
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          
          const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { upsert: true, new: true }
          );

          console.log(`\nSuccess! Admin user '${user.email}' created/updated.`);
          process.exit(0);
        } catch (error) {
          console.error('\nError creating user:', error.message);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

createAdmin();
