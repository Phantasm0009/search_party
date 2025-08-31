#!/usr/bin/env node

/**
 * Custom build script that forces HTTP-only builds
 * This overrides React Create App's default HTTPS behavior in production
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables to force HTTP
process.env.HTTPS = 'false';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.PUBLIC_URL = '';
process.env.NODE_ENV = 'production';

console.log('🔧 Building with HTTP-only configuration...');

// Run the React build
const buildProcess = spawn('react-scripts', ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HTTPS: 'false',
    GENERATE_SOURCEMAP: 'false',
    PUBLIC_URL: '',
    NODE_ENV: 'production'
  }
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(code);
  }

  console.log('✅ Build completed, fixing HTTPS references...');
  
  // Post-process built files to ensure HTTP-only
  const buildDir = path.join(__dirname, 'build');
  
  function fixHttpsInFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace any HTTPS references with HTTP
      content = content.replace(/https:\/\//g, 'http://');
      
      // Fix any hardcoded secure protocols
      content = content.replace(/"https:/g, '"http:');
      content = content.replace(/'https:/g, "'http:");
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed HTTPS references in: ${path.relative(buildDir, filePath)}`);
    } catch (error) {
      console.warn(`Warning: Could not process ${filePath}:`, error.message);
    }
  }
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
        fixHttpsInFile(filePath);
      }
    });
  }
  
  processDirectory(buildDir);
  console.log('🎉 HTTP-only build completed successfully!');
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});
