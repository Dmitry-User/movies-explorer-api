const router = require('express').Router();
const { verifyMovie, verifyMovieId } = require('../middlewares/verify-movie');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', verifyMovie, createMovie);
router.delete('/:_id', verifyMovieId, deleteMovie);

module.exports = router;
