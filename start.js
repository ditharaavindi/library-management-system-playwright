const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Library Management System...\n');

// Function to open browser after delay
function openBrowser() {
  setTimeout(() => {
    console.log('🌐 Opening browser...');
    const cmd = process.platform === 'darwin' 
      ? 'open http://localhost:3000'
      : process.platform === 'win32' 
      ? 'start http://localhost:3000'
      : 'xdg-open http://localhost:3000';
    
    exec(cmd, (error) => {
      if (error) {
        console.log('Please manually open: http://localhost:3000');
      }
    });
  }, 8000); // Wait 8 seconds for servers to start
}

// Display demo credentials
console.log('🔐 Demo Credentials:');
console.log('   👑 Admin: admin@library.com / admin123');
console.log('   📋 Librarian: librarian@library.com / librarian123');
console.log('   👤 User: user@library.com / user123\n');

console.log('📚 Starting servers...\n');

// Start the browser opening timer
openBrowser();

// Use concurrently to start both servers
const concurrently = spawn('npx', ['concurrently', 
  '"cd backend && PORT=5001 npm run dev"', 
  '"cd frontend && PORT=3000 npm run dev"'
], {
  stdio: 'inherit',
  shell: true
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  concurrently.kill();
  process.exit(0);
});

concurrently.on('exit', (code) => {
  process.exit(code);
});