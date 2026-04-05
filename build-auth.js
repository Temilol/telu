#!/usr/bin/env node

/**
 * Build script to inject environment variables into auth template
 * Reads .env file and generates js/seating-auth.js with the password injected
 */

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found. Please copy .env.example to .env and set your password.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const adminPasswordMatch = envContent.match(/ADMIN_PASSWORD=(.+)/);

if (!adminPasswordMatch || !adminPasswordMatch[1] || adminPasswordMatch[1].trim() === '') {
  console.error('❌ Error: ADMIN_PASSWORD not found or empty in .env file');
  console.error('');
  console.error('Make sure your .env file contains:');
  console.error('  ADMIN_PASSWORD=your_password_here');
  console.error('');
  console.error('(no quotes needed)');
  process.exit(1);
}

const adminPassword = adminPasswordMatch[1].trim().replace(/^["']|["']$/g, '');

// Read template
const templatePath = path.join(__dirname, 'js', 'seating-auth.js.template');
if (!fs.existsSync(templatePath)) {
  console.error('❌ Error: seating-auth.js.template not found');
  process.exit(1);
}

const templateContent = fs.readFileSync(templatePath, 'utf-8');

// Replace placeholder
const authContent = templateContent.replace(/__ADMIN_PASSWORD__/g, adminPassword);

// Write output
const outputPath = path.join(__dirname, 'js', 'seating-auth.js');
fs.writeFileSync(outputPath, authContent);

console.log('✓ Generated seating-auth.js with password from .env');
