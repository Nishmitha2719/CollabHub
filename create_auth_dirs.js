const fs = require('fs');
const path = require('path');

const directories = [
  'app/auth/login',
  'app/auth/signup',
  'app/auth/forgot-password',
  'app/auth/callback',
  'app/projects',
  'app/post-project',
  'app/dashboard',
  'components/home',
  'middleware',
];

console.log('Creating new directories for authentication and features...\n');

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created: ${dir}`);
  } else {
    console.log(`○ Exists: ${dir}`);
  }
});

console.log('\n✓ Directory structure ready!');
