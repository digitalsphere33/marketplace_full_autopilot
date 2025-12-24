import { strict as assert } from 'assert';
import { signParams } from '../src/payments/payfast.js';

export async function testPayFastSigning() {
  const params = { merchant_id: '10000100', amount: '10.00' };
  const sig = signParams(params);
  assert(typeof sig === 'string' && sig.length === 32, 'Signature should be 32-char string');
  console.log('PayFast signing test passed');
}
