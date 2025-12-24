import { run as simRun } from '../src/test/simulate_ipn.js';
export async function run() { await simRun(); }
if (process.argv[1] && process.argv[1].endsWith('simulate_ipn.js')) run().catch(e=>console.error(e));
