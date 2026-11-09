import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e', timeout:240000, workers:1,
  expect:{timeout:20000},
  use:{baseURL:'http://127.0.0.1:3001',channel:'chrome',headless:true,actionTimeout:20000,screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'node tests/start-web.mjs',url:'http://127.0.0.1:3001/login',timeout:180000,reuseExistingServer:true},
});
