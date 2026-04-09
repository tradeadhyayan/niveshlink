import fetch from 'node-fetch';

const payload = {
  amount: 10,
  customer_details: {
    customer_phone: '1234567890',
    customer_name: 'Test User',
    // optional fields can be omitted
  },
  order_meta: {
    return_url: 'https://example.com/payment-status?order_id={order_id}'
  }
};

(async () => {
  try {
    const res = await fetch('https://nivesh-link-webinar-fe7pbcvfz-ajays-projects-3fcb2685.vercel.app/api/create-cashfree-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
})();
