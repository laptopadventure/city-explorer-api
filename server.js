'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
app.use(cors());

const PORT = process.env.PORT || 3002;

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description.toLowerCase();
  }
}

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

app.get('/weather', async (req, res, next) => {
  const reg = /[A-Z][a-z]+/;
  const searchQuery = req.query.city;
  const sanitized = searchQuery.match(reg)[0];
  if(!sanitized) {
    res.status(404).send('Could not find the weather lookup for your location.');
    return;
  }
  let forecast;
  try {
    const call = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&city=${sanitized}&lat=${parseInt(req.query.lat)}&lon=${parseInt(req.query.lon)}&days=3&units=I`;
    const weatherRes = await axios.get(call);
    forecast = weatherRes.data.data.map(day => new Forecast(day.datetime, day.weather.description));
    res.status(200).send(forecast);
  } catch(error) {
    next(error);
  }
});

app.get('/movies', async (req, res, next) => {
  const reg = /[A-Z][a-z]+/;
  const searchQuery = req.query.city;
  const sanitizedQuery = searchQuery.match(reg)[0];
  let movies = [];
  try {
    const call = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_API_KEY}&query=${sanitizedQuery}`;
    let movieRes = await axios.get(call);
    movies = movieRes.data.results.filter(movie => movie.vote_count > 10);
    movies = movies.map(movie => new Movie(movie));
    res.status(200).send(movies);
  } catch(error) {
    console.error(`error! ${error}`);
    next(error);
  }
});

app.get('/', (req, res) => {
  res.send('home');
});

app.get('*', (req, res) => {
  res.status(404).send('No end point.');
});

app.use((error, req, res, next) => {
  res.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`PORT ${PORT} up`));
