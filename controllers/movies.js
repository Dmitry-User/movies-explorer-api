const mongoose = require('mongoose');
const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const {
  dataIncorrect,
  movieIdNotFound,
  movieDeleteForbidden,
  movieDeleted,
  movieIdIncorrect,
} = require('../utils/constants');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;

  Movie.create({
    ...req.body,
    owner,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(dataIncorrect));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(new NotFoundError(movieIdNotFound))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError(movieDeleteForbidden);
      }
      return Movie.findByIdAndRemove(movie)
        .then(() => {
          res.send({ message: movieDeleted });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError(movieIdIncorrect));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
