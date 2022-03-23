'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const weatherData = require('./data/weather.json');
app.use(cors());

const PORT = process.env.PORT || 3002;

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get('/weather', (req, res, next) => {
  const snipRegex = /([a-z]+)/i;
  let sanitized_name = req.query.city.toLowerCase();
  sanitized_name = sanitized_name.match(snipRegex)[0];
  const findRegex = RegExp(sanitized_name);
  const weatherCity = weatherData.find(loc => !!loc.city_name.toLowerCase().match(findRegex));
  let forecast;
  try {
    forecast = weatherCity.data.map(day => new Forecast(day.valid_date, day.weather.description));
  } catch(error) {
    next(error);
  }
  res.status(200).send(forecast);
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
