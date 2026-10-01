const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/paymentController');

router.use(auth);
router.post('/verify', c.verify);

module.exports = router;
