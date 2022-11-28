const router = require('express').Router();
const userRouter = require('./user');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const { verifyLogin, verifyUserCreate } = require('../middlewares/verify-user');
const { login, logout, createUser } = require('../controllers/user');
const NotFoundError = require('../errors/not-found-err');

// проверка сервера, Pm2 должен его восстанавливать
router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
// удалить этот код после успешного прохождения ревью

router.post('/signup', verifyUserCreate, createUser);
router.post('/signin', verifyLogin, login);

router.use(auth);
router.use('/users', userRouter);
router.use('/movies', moviesRouter);
router.post('/signout', logout);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый адрес не найден'));
});

module.exports = router;
