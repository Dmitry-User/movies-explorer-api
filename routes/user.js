const router = require('express').Router();
const { verifyUserUpdate } = require('../middlewares/verify-user');
const { getUser, updateUser } = require('../controllers/user');

router.get('/me', getUser);
router.patch('/me', verifyUserUpdate, updateUser);

module.exports = router;
