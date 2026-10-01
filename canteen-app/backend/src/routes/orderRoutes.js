const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/orderController');

router.use(auth); // all order routes require login

router.post('/', c.create);
router.get('/history', c.history);
router.get('/:id', c.getOne);

module.exports = router;
