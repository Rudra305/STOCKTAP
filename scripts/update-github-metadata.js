#!/usr/bin/env node

/**
 * Updates GitHub repository description, homepage URL, and topic tags via GitHub API.
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token node scripts/update-github-metadata.js
 */

const https = require('https');

const GITHUB_REPO = 'Rudra305/STOCKTAP';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const description = '📦 Fast, touch-optimized tap-to-count inventory management & audit app with Owner Passcode PIN lock, low-stock alerts, and MongoDB backend (Expo SDK 54, React Native 0.81, Node.js, Express)';
const homepage = 'https://stocktapmerlin.vercel.app';

console.log(`\n🚀 Updating GitHub Repository Metadata for ${GITHUB_REPO}...`);
console.log(`📝 Description: ${description}`);
console.log(`🔗 Homepage: ${homepage}\n`);

if (!GITHUB_TOKEN) {
  console.log('ℹ️ GITHUB_TOKEN environment variable not set.');
  console.log('To update automatically via API, run:');
  console.log('  $env:GITHUB_TOKEN="your_personal_access_token"; node scripts/update-github-metadata.js');
  process.exit(0);
}

const payload = Buffer.from(
  JSON.stringify({
    description,
    homepage
  })
);

const req = https.request(
  {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}`,
    method: 'PATCH',
    headers: {
      'User-Agent': 'StockTap-Metadata-Sync',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  },
  (res) => {
    let body = '';
    res.on('data', (d) => (body += d));
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.description) {
          console.log(`✅ GitHub repository description updated successfully!`);
          console.log(`✅ Homepage set to: ${json.homepage}`);
        } else {
          console.log('API Response:', json.message || body);
        }
      } catch (e) {
        console.log('Finished updating GitHub repository.');
      }
    });
  }
);

req.on('error', (e) => {
  console.error('❌ Failed to update GitHub repository:', e.message);
});

req.write(payload);
req.end();
