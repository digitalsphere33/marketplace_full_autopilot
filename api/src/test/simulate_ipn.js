import axios from 'axios';
import { signParams } from '../payments/payfast.js';

export async function run() {
  const orderId = process.env.ORDER_ID || 'test-order-id';
  const params = {
    merchant_id: '10000100',
    merchant_key: '46f0cd694581a',
    amount: '100.00',
    item_name: `Order ${orderId}`,
    split_payment: 1,
    split_primary_receiver: '10.00',
    split_secondary_receiver: '90.00'
  };
  const signature = signParams(params);
  const form = { ...params, signature };
  const res = await axios.post('http://127.0.0.1:3000/webhooks/payfast', form);
  console.log(res.data);
}

if (process.argv[1] && process.argv[1].endsWith('simulate_ipn.js')) {
  run().catch(e=>console.error(e));
}

