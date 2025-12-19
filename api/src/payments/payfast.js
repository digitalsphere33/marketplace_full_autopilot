import crypto from 'crypto';
import { config } from '../config.js';

function buildQuery(params) {
  const keys = Object.keys(params).sort();
  return keys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
}

export function signParams(params) {
  const query = buildQuery(params);
  const toSign = config.payfast.passphrase ? `${query}&passphrase=${encodeURIComponent(config.payfast.passphrase)}` : query;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export function computeSplit(totalCents, commissionPercent) {
  const platformFee = Math.round(totalCents * (commissionPercent / 100));
  const sellerAmount = totalCents - platformFee;
  return { platformFee, sellerAmount };
}

export function buildPaymentForm({ amount, buyerEmail, itemName, returnUrl, cancelUrl, notifyUrl, sellerId }) {
  const totalCents = Math.round(Number(amount) * 100);
  const { platformFee, sellerAmount } = computeSplit(totalCents, config.payfast.commissionPercent);

  const params = {
    merchant_id: config.payfast.merchantId,
    merchant_key: config.payfast.merchantKey,
    amount: (totalCents / 100).toFixed(2),
    item_name: itemName || 'MzansiMart Order',
    email_address: buyerEmail,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    // Split payment fields (PayFast Adaptive Payments)
    // Note: Exact field names may differ; adjust with live docs in Final Setup.
    split_payment: 1,
    split_primary_receiver: (platformFee / 100).toFixed(2),
    split_secondary_receiver: (sellerAmount / 100).toFixed(2),
    custom_str1: sellerId
  };
  const signature = signParams(params);
  return { params, signature, redirect: `${config.payfast.baseUrl}/eng/process?${buildQuery({ ...params, signature })}` };
}

export function verifyIpn(form) {
  const signature = form.signature;
  const { signature: _omit, ...rest } = form;
  const calc = signParams(rest);
  return signature && signature === calc;
}
