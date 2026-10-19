/* eslint-disable no-console */
import http from 'http';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5000';

function makeRequest(path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(`${baseUrl}${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 500, body }));
      })
      .on('error', reject);
  });
}

async function runSmokeTests() {
  console.log(`🚀 Starting production smoke tests against ${baseUrl}...\n`);

  const endpoints = [
    { path: '/api/v1/health', expectedStatus: 200, name: 'Health Probe' },
    { path: '/api/v1/health/ready', expectedStatus: 200, name: 'Database Readiness Probe' },
    { path: '/sitemap.xml', expectedStatus: 200, name: 'SEO Sitemap Index' },
    { path: '/robots.txt', expectedStatus: 200, name: 'Robots.txt Directives' },
    { path: '/api/v1/search/properties', expectedStatus: 200, name: 'Property Search API' },
    { path: '/api/v1/packages', expectedStatus: 200, name: 'Monetization Packages API' },
  ];

  let passed = 0;
  for (const ep of endpoints) {
    try {
      const res = await makeRequest(ep.path);
      if (res.status === ep.expectedStatus) {
        console.log(`✅ [PASS] ${ep.name} (${ep.path}) -> HTTP ${res.status}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${ep.name} (${ep.path}) -> Expected HTTP ${ep.expectedStatus}, got ${res.status}`);
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${ep.name} (${ep.path}) -> ${(err as Error).message}`);
    }
  }

  console.log(`\n📊 Smoke Test Summary: ${passed}/${endpoints.length} passed.`);
  if (passed !== endpoints.length) {
    process.exit(1);
  }
}

runSmokeTests();
