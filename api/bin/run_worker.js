#!/usr/bin/env node
import { runOnce } from '../scripts/payout_worker.js';

const mode = process.argv[2] || 'once';
if (mode === 'once') {
  runOnce().then(()=>process.exit(0)).catch(e=>{console.error(e); process.exit(1);});
} else {
  // simple loop
  setInterval(async () => {
    try { await runOnce(); } catch (e) { console.error(e); }
  }, 60 * 1000);
}
