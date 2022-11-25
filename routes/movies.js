const router = require('express').Router();
const { verifyMovieId } = require('../middlewares/verify-movie');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', createMovie);
router.delete('/:_id', verifyMovieId, deleteMovie);

module.exports = router;
