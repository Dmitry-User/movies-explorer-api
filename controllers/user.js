const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const { DEV_SECRET } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь с указанным _id не найден'))
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { password, ...user } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      user,
      password: hash, // записываем хеш в базу
    }))
    .then((newUser) => {
      res.send(newUser);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с указанным email уже зарегистрирован'));
      }
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { ...user } = req.body;

  User.findByIdAndUpdate(userId, { ...user }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь с указанным _id не найден'))
    .then((updatedUser) => {
      res.send(updatedUser);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : DEV_SECRET,
        { expiresIn: '7d' },
      );
      res
        .cookie('authorization', token, {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
          maxAge: 3600000 * 24 * 7,
        })
        .send({ message: 'Авторизация прошла успешно!' });
    })
    .catch(next);
};

const logout = (req, res, next) => {
  try {
    res.clearCookie('authorization').send({ message: 'Вы вышли из профиля' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUser,
  createUser,
  updateUser,
  login,
  logout,
};
