'use strict';

const axios = require('axios');

class Movie {
  constructor(movie) {
    this.poster = movie.poster_path || '';
    this.title = movie.title;
    this.overview = movie.overview;
    this.average_votes = movie.vote_average;
    this.vote_count = movie.vote_count;
    this.release_date = movie.release_date;
    this.popularity = movie.popularity;
  }
}

const getMovies = (req, res, next) => {
  const reg = /[A-Z][a-z]+/;
  const searchQuery = req.query.city;
  const sanitizedQuery = searchQuery.match(reg)[0];
  let movies = [];
  const call = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_API_KEY}&query=${sanitizedQuery}`;
  axios.get(call)
    .then(result => {
      movies = result.data.results.filter(movie => movie.vote_count > 10)
        .map(movie => new Movie(movie));
      res.status(200).send(movies);
    })
    .catch(err => {
      console.error(`error! ${err}`);
      next(err);
    });
};

module.exports = getMovies;
