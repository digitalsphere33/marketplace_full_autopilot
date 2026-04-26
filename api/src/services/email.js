import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY || ''
  }
});

export async function sendOrderConfirmation(order, to) {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Total:</strong> R ${order.total}</p>
  `;
  await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@mzansimart.co.za', to, subject: `Order ${order.id} confirmed`, html });
}

export async function sendSellerNotification(order, to) {
  const html = `
    <h1>New Order</h1>
    <p>You have a new order to fulfil.</p>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Amount to you:</strong> R ${order.seller_amount}</p>
  `;
  await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@mzansimart.co.za', to, subject: `New Order ${order.id}`, html });
}

export async function sendPayoutNotification(sellerEmail, amount) {
  const html = `
    <h1>Payout Processed</h1>
    <p>Your payout of R ${amount} has been processed and will reflect in your account soon.</p>
  `;
  await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@mzansimart.co.za', to: sellerEmail, subject: `Payout R ${amount} processed`, html });
}
