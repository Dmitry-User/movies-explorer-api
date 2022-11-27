const mongoose = require('mongoose');
const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  // const {
  //   country,
  //   director,
  //   duration,
  //   year,
  //   description,
  //   image,
  //   trailerLink,
  //   nameRU,
  //   nameEN,
  //   thumbnail,
  //   movieId,
  // } = req.body;
  // const { ...movieData } = req.body;

  const owner = req.user._id;

  Movie.create({ ...req.body, owner })
    .then((newMovie) => {
      res.send(newMovie);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(new NotFoundError('Фильм с указанным _id не найден'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Запрещено удалять чужие фильмы');
      }
      return Movie.findByIdAndRemove(movie)
        .then(() => {
          res.send({ message: 'Фильм удален' });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Не корректный _id фильма'));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
