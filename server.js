'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const getWeather = require('./modules/weather')
const getMovies = require('./modules/movies')
app.use(cors());

const PORT = process.env.PORT || 3002;

app.get('/weather', getWeather);

app.get('/movies', getMovies);

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
