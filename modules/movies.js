'use strict';

const axios = require('axios');
const cache = require('./cache');

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
  const sanitizedQuery = req.query.city.match(reg)[0];
  const call = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_API_KEY}&query=${sanitizedQuery}`;
  const key = `movies-${sanitizedQuery}`;
  try {
    if(cache[key] && Date.now() - cache[key].timestamp < 60000) {
      console.log('movies cache hit');
      res.status(200).send(cache[key].data);
    } else {
      console.log('movies cache miss');
      axios.get(call)
        .then(response => {
          const movies = response.data.results.filter(movie => movie.vote_count > 10)
            .map(movie => new Movie(movie));
          cache[key] = {
            timestamp: Date.now(),
            data: movies,
          };
          res.status(200).send(movies);
        });
    }
  } catch (err) {
    console.error(`error! ${err}`);
    next(err);
  }
};

module.exports = getMovies;
