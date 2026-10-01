const paymentService = require('../services/paymentService');
const { asyncHandler } = require('../middleware/errorHandler');

// Verify + fulfil a (mock) payment. Body: { providerOrderId, method, simulateFailure }
const verify = asyncHandler(async (req, res) => {
    const { providerOrderId, method, simulateFailure } = req.body;
    const result = await paymentService.payAndFulfill(req.user.userId, {
        providerOrderId,
        method,
        simulateFailure: Boolean(simulateFailure),
    });
    res.json(result);
});

module.exports = { verify };
