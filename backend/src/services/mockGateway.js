// A self-contained DUMMY payment gateway.
// It imitates the shape of a real gateway (Razorpay-style) so that swapping in
// a real provider later is mostly a matter of replacing this file.
const crypto = require('crypto');

const rand = (n = 12) => crypto.randomBytes(n).toString('hex').slice(0, n);

// Step 1 — the gateway "creates an order" to be paid.
function createOrder(amount, currency = 'INR') {
    return {
        providerOrderId: `order_mock_${rand()}`,
        amount,
        currency,
        key: 'mock_test_key', // what a frontend checkout would use publicly
    };
}

// Step 2 — the gateway "charges" and returns a payment + signature.
// `simulateFailure` lets the UI demonstrate the failure path on demand.
function charge({ providerOrderId, amount, method = 'card', simulateFailure = false }) {
    if (simulateFailure) {
        return { status: 'failed', reason: 'Payment declined by issuer (simulated).' };
    }
    const providerPaymentId = `pay_mock_${rand()}`;
    const signature = sign(providerOrderId, providerPaymentId);
    return { status: 'paid', providerPaymentId, signature, method, amount };
}

// A real gateway signs (orderId|paymentId) with a secret; we mirror that so the
// server can "verify" the payment exactly like it would in production.
function sign(providerOrderId, providerPaymentId) {
    const secret = process.env.PAYMENT_SECRET || 'mock_secret';
    return crypto
        .createHmac('sha256', secret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');
}

function verifySignature(providerOrderId, providerPaymentId, signature) {
    return sign(providerOrderId, providerPaymentId) === signature;
}

module.exports = { createOrder, charge, verifySignature };
