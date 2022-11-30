const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const { DEV_SECRET } = require('../utils/config');
const {
  userIdNotFound,
  dataIncorrect,
  emailExists,
  userLogout,
} = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  User.findById(req.user._id, { _id: 0 })
    .orFail(new NotFoundError(userIdNotFound))
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { password, ...userData } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ ...userData, password: hash }))
    .then((newUser) => {
      res.send(newUser);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(dataIncorrect));
      }
      if (err.code === 11000) {
        return next(new ConflictError(emailExists));
      }
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;

  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .orFail(new NotFoundError(userIdNotFound))
    .then((updatedUser) => {
      res.send(updatedUser);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(dataIncorrect));
      }
      if (err.code === 11000) {
        return next(new ConflictError(emailExists));
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
        .send({ token });
    })
    .catch(next);
};

const logout = (req, res, next) => {
  try {
    res
      .clearCookie('authorization')
      .send({ message: userLogout });
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
