const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/favoriteController');

router.use(auth);
router.get('/', c.list);
router.post('/:menuItemId', c.add);
router.delete('/:menuItemId', c.remove);

module.exports = router;
