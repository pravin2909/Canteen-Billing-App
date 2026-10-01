const router = require('express').Router();
const c = require('../controllers/menuController');

router.get('/', c.list);
router.get('/:id', c.getOne);

module.exports = router;
