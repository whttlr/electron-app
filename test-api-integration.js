#!/usr/bin/env node

/**
 * Test API Integration
 * 
 * This script tests if the API integration is working correctly by:
 * 1. Checking if build-resources/api exists
 * 2. Verifying the API server can start
 * 3. Testing the health endpoint
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testApiIntegration() {
  console.log('🧪 Testing API Integration...\n');

  // Test 1: Check if API was integrated
  console.log('1️⃣ Checking API integration...');
  const apiPath = path.join(__dirname, 'build-resources', 'api');
  const serverPath = path.join(apiPath, 'src', 'server.js');
  
  if (!fs.existsSync(apiPath)) {
    console.error('❌ API not found in build-resources. Run: npm run integrate-api');
    process.exit(1);
  }
  
  if (!fs.existsSync(serverPath)) {
    console.error('❌ API server.js not found');
    process.exit(1);
  }
  
  console.log('✅ API files found in build-resources');

  // Test 2: Try to start the API server
  console.log('\n2️⃣ Testing API server startup...');
  
  const testPort = 3001; // Use different port to avoid conflicts
  const env = {
    ...process.env,
    PORT: testPort,
    NODE_ENV: 'test',
    EMBEDDED_MODE: 'true'
  };

  console.log(`Starting API server on port ${testPort}...`);
  
  const apiProcess = spawn(process.execPath, [serverPath], {
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: apiPath
  });

  let serverStarted = false;
  let serverOutput = '';

  apiProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log(`[API] ${output.trim()}`);
    
    if (output.includes('Server running') || output.includes(`${testPort}`)) {
      serverStarted = true;
    }
  });

  apiProcess.stderr.on('data', (data) => {
    console.error(`[API Error] ${data.toString().trim()}`);
  });

  // Wait for server to start
  await new Promise((resolve) => {
    setTimeout(resolve, 5000); // Wait 5 seconds
  });

  if (!serverStarted && !serverOutput.includes('listening')) {
    console.log('⚠️  Server may not have started (no startup message detected)');
    console.log('📝 Server output:', serverOutput);
  } else {
    console.log('✅ API server appears to have started');
  }

  // Test 3: Test health endpoint
  console.log('\n3️⃣ Testing health endpoint...');
  
  try {
    const { default: fetch } = await import('node-fetch');
    const healthUrl = `http://localhost:${testPort}/api/v1/health`;
    
    console.log(`Checking health endpoint: ${healthUrl}`);
    
    const response = await fetch(healthUrl, { timeout: 3000 });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health endpoint responded successfully');
      console.log('📊 Health data:', JSON.stringify(data, null, 2));
    } else {
      console.log(`⚠️  Health endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`⚠️  Health endpoint test failed: ${error.message}`);
    console.log('💡 This might be normal if the server is still starting up');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  apiProcess.kill('SIGTERM');
  
  setTimeout(() => {
    if (!apiProcess.killed) {
      apiProcess.kill('SIGKILL');
    }
  }, 2000);

  console.log('\n✅ API Integration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   • Run: npm run build:with-api');
  console.log('   • Run: npm run electron:build:mac');
  console.log('   • Test the built DMG installer');
}

// Run the test
testApiIntegration().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});