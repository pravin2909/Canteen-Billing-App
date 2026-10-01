const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const c = require('../controllers/adminController');

router.use(auth, adminOnly); // every admin route is guarded

router.post('/menu', c.createMenuItem);
router.put('/menu/:id', c.updateMenuItem);
router.delete('/menu/:id', c.deleteMenuItem);

router.get('/orders', c.listOrders);
router.patch('/orders/:id/status', c.updateOrderStatus);

module.exports = router;
