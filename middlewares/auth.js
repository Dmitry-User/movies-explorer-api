const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
const { DEV_SECRET } = require('../utils/config');
const { authRequired } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  const { authorization } = req.cookies;

  if (!authorization) {
    throw new UnauthorizedError(authRequired);
  }

  let payload;

  try {
    payload = jwt.verify(
      authorization,
      NODE_ENV === 'production' ? JWT_SECRET : DEV_SECRET,
    );
  } catch (err) {
    throw new UnauthorizedError(authRequired);
  }

  req.user = payload;
  return next();
};

module.exports = auth;
