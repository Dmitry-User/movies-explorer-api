const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/unauthorized-err');
const { loginIncorrect } = require('../utils/constants');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    validate: validator.isEmail,
    unique: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
}, {
  versionKey: false,
  toObject: { useProjection: true },
  toJSON: { useProjection: true },
});

userSchema.statics.findUserByCredentials = function detectUser(email, password) {
  return this.findOne({ email })
    .select('+password')
    .orFail(new UnauthorizedError(loginIncorrect))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) {
          throw new UnauthorizedError(loginIncorrect);
        }
        return user;
      }));
};

module.exports = model('user', userSchema);
