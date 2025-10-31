import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Running Playwright Global Setup');
  
  // Wait for servers to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if backend is running
    console.log('🔍 Checking backend health...');
    await page.goto('http://localhost:5001/health');
    console.log('✅ Backend is ready');
    
    // Check if frontend is running
    console.log('🔍 Checking frontend...');
    await page.goto('http://localhost:3000');
    console.log('✅ Frontend is ready');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global Setup Complete');
}

export default globalSetup;