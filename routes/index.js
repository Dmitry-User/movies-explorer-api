const router = require('express').Router();
const userRouter = require('./user');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const { verifyLogin, verifyUserCreate } = require('../middlewares/verify-user');
const { login, logout, createUser } = require('../controllers/user');
const NotFoundError = require('../errors/not-found-err');
const { routeNotFound } = require('../utils/constants');

router.post('/signup', verifyUserCreate, createUser);
router.post('/signin', verifyLogin, login);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', moviesRouter);
router.post('/signout', logout);

router.use('*', (req, res, next) => {
  next(new NotFoundError(routeNotFound));
});

module.exports = router;
